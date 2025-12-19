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

  // ===================== AUTO DIFFICULTY DETECTION =====================
  private async detectDifficulty(
    problem: string,
    code: string,
  ): Promise<'easy' | 'medium' | 'hard'> {
    const prompt = `
You are a competitive programming expert.

Based on the problem statement and solution code below,
classify the difficulty as ONE of:
easy, medium, hard.

Return ONLY one word.

Problem:
${problem}

Code:
${code}
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw =
      response.choices[0].message.content
        ?.toLowerCase()
        .trim() || 'easy';

    if (raw.includes('hard')) return 'hard';
    if (raw.includes('medium')) return 'medium';
    return 'easy';
  }

  // ===================== ANALYZE CODE =====================
  async analyze(data: any) {
    try {
      // 🔐 Auth guard
      if (!data.email) {
        return { error: 'User not authenticated.' };
      }

      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return { error: 'User not found in database.' };
      }

      // 🔍 Detect difficulty first
      const detectedLevel = await this.detectDifficulty(
        data.problem,
        data.code,
      );

      // 🧠 STRUCTURED PROMPT (MOST IMPORTANT PART)
      const prompt = `
You are a competitive programming mentor.

Analyze the following submission and return ONLY valid JSON.
NO markdown. NO extra text. NO explanations outside JSON.

JSON FORMAT:
{
  "explanation": string,
  "timeComplexity": string,
  "spaceComplexity": string,
  "betterApproaches": [
    {
      "title": string,
      "description": string,
      "code": string,
      "timeComplexity": string,
      "spaceComplexity": string
    }
  ],
  "nextSteps": string
}

Problem:
${data.problem}

User Code:
${data.code}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      const raw = response.choices[0].message.content ?? '{}';

      // 🛡️ Safe JSON parse
      let parsedAnalysis: any;
      try {
        parsedAnalysis = JSON.parse(raw);
      } catch (err) {
        parsedAnalysis = {
          explanation: raw,
          timeComplexity: '',
          spaceComplexity: '',
          betterApproaches: [],
          nextSteps: '',
        };
      }

      // 💾 Save submission (raw text also preserved)
      const submission = await this.prisma.submission.create({
        data: {
          problem: data.problem,
          code: data.code,
          analysis: raw,
          level: detectedLevel,
          user: {
            connect: { id: user.id },
          },
        },
      });

      // ✅ FINAL RESPONSE (frontend-friendly)
      return {
        id: submission.id,
        level: detectedLevel,
        analysis: parsedAnalysis,
      };
    } catch (error) {
      console.error('Analyze error:', error);
      return {
        error:
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
          `${i + 1}. Difficulty: ${s.level}\nProblem: ${s.problem}`,
      )
      .join('\n\n');

    const prompt = `
You are a competitive programming mentor.

Based on the following recent submissions:

${summary}

Identify:
1. Weak areas
2. Topics to improve
3. 3 recommended next LeetCode problem types

Be concise and actionable.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content ?? '';
  }
}
