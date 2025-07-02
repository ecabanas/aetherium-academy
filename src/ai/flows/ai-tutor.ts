'use server';

/**
 * @fileOverview An AI tutoring chatbot flow.
 *
 * - aiTutorChatbot - A function that handles the chatbot conversation.
 * - AiTutorChatbotInput - The input type for the aiTutorChatbot function.
 * - AiTutorChatbotOutput - The return type for the aiTutorChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutorChatbotInputSchema = z.object({
  topic: z.string().describe('The topic to be tutored on (e.g., Machine Learning, Quantum Computing).'),
  question: z.string().describe('The question to ask the AI tutor.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the AI'),
});
export type AiTutorChatbotInput = z.infer<typeof AiTutorChatbotInputSchema>;

const AiTutorChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer from the AI tutor.'),
});
export type AiTutorChatbotOutput = z.infer<typeof AiTutorChatbotOutputSchema>;

export async function aiTutorChatbot(input: AiTutorChatbotInput): Promise<AiTutorChatbotOutput> {
  return aiTutorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorChatbotPrompt',
  input: {schema: AiTutorChatbotInputSchema},
  output: {schema: AiTutorChatbotOutputSchema},
  prompt: `You are an AI tutor specializing in {{{topic}}}.

  Your goal is to provide clear, personalized explanations to the user's questions.
  Maintain context within the session for a fluid and personalized dialogue.

  The user has asked the following question: {{{question}}}

  {{#if chatHistory}}
  Here is the chat history:
  {{#each chatHistory}}
  {{#if (eq role \"user\")}}
  User: {{{content}}}
  {{else}}
  Assistant: {{{content}}}
  {{/if}}
  {{/each}}
  {{/if}}

  Answer the question to the best of your ability:
  `,
});

const aiTutorChatbotFlow = ai.defineFlow(
  {
    name: 'aiTutorChatbotFlow',
    inputSchema: AiTutorChatbotInputSchema,
    outputSchema: AiTutorChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      answer: output!.answer,
    };
  }
);
