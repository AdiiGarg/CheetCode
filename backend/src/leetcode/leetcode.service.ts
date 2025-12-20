import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LeetCodeService {
  async fetchProblem(input: string) {
    // Extract slug from URL
    const match = input.match(/problems\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid LeetCode URL');
    }

    const slug = match[1];

    const query = {
      query: `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            difficulty
            content
          }
        }
      `,
      variables: { titleSlug: slug },
    };

    const res = await axios.post(
      'https://leetcode.com/graphql',
      query,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const question = res.data?.data?.question;

    if (!question) {
      throw new Error('Question not found');
    }

    return {
      title: question.title,
      difficulty: question.difficulty.toLowerCase(),
      description: this.cleanHTML(question.content),
    };
  }

  // 🔥 IMPORTANT: HTML → clean readable text
  private cleanHTML(html: string): string {
    if (!html) return '';

    return html
      .replace(/<pre>/g, '\n')
      .replace(/<\/pre>/g, '\n')
      .replace(/<code>/g, '')
      .replace(/<\/code>/g, '')
      .replace(/<[^>]+>/g, '') // remove all tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
