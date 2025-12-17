import OpenAI from "openai";

export class AnalysisService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async analyze(data: any) {
    const prompt = `
You are a competitive programming mentor.

User Level: ${data.level}

Problem:
${data.problem}

User Code:
${data.code}

Tasks:
1. Explain approach
2. Point mistakes
3. Give 3 better approaches
4. Rewrite optimized code
5. Give key takeaways
`;

    const res = await this.openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
    });

    return { result: res.choices[0].message.content };
  }
}
