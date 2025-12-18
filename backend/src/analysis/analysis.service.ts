import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // ===================== ANALYZE CODE =====================
  async analyze(data: any) {
    try {
      // 🔐 Auth guard
      if (!data.email) {
        return { result: 'User not authenticated.' };
      }

      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return { result: 'User not found in database.' };
      }

      // ✅ HARD NORMALIZATION (dashboard-safe)
      const level: 'beginner' | 'intermediate' | 'advanced' =
        data.level === 'beginner' ||
        data.level === 'intermediate' ||
        data.level === 'advanced'
          ? data.level
          : 'beginner';

      const prompt = `
You are a competitive programming mentor.

User level: ${level}

Problem:
${data.problem}

User code:
${data.code}

Tasks:
1. Explain the approach
2. Point out mistakes
3. Suggest 3 better approaches
4. Rewrite optimized code
5. Give key takeaways
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.choices[0].message.content ?? '';

      // 💾 SAVE SUBMISSION
      const submission = await this.prisma.submission.create({
        data: {
          problem: data.problem,
          code: data.code,
          analysis: analysisText,
          level,
          user: {
            connect: { id: user.id },
          },
        },
      });

      return {
        id: submission.id,
        result: submission.analysis,
      };
    } catch (error) {
      console.error('Analyze error:', error);
      return {
        result:
          'Error while analyzing code. Please check backend logs for details.',
      };
    }
  }

  // ===================== AI RECOMMENDATIONS =====================
  async getRecommendations(email: string) {
    const submissions = await this.prisma.submission.findMany({
      where: {
        user: { email },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (submissions.length === 0) {
      return 'Not enough data to generate recommendations.';
    }

    const summary = submissions
      .map(
        (s, i) =>
          `${i + 1}. Level: ${s.level}\nProblem: ${s.problem}`,
      )
      .join('\n\n');

    const prompt = `
You are a competitive programming mentor.

Based on the following recent submissions:

${summary}

Identify:
1. Weak areas
2. Topics to improve
3. 3 recommended next problem types

Be concise and actionable.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content ?? '';
  }
}
