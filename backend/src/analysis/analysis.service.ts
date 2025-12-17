import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyze(data: any) {
    try {
      const prompt = `
You are a competitive programming mentor.

User level: ${data.level}

Problem:
${data.problem}

User code:
${data.code}

Tasks:
1. Explain the approach
2. Point out mistakes
3. Suggest 3 better approaches
4. Suggest 3 better approaches
5. Rewrite optimized code
6. Give key takeaways
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.choices[0].message.content ?? '';

      // ✅ SAVE TO DATABASE
      const submission = await this.prisma.submission.create({
        data: {
          problem: data.problem,
          code: data.code,
          analysis: analysisText,
          userId: 'anonymous', // TEMP, will replace with real user
        },
      });

      return {
        id: submission.id,
        result: submission.analysis,
      };
    } catch (error: any) {
      console.error('Analyze error:', error);

      return {
        result:
          'Error while analyzing code. Please check backend logs for details.',
      };
    }
  }
}
