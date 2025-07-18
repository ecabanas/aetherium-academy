'use server';

/**
 * @fileOverview A flow to generate a summary from a chat conversation.
 *
 * - summarizeSession - A function that handles the session summarization process.
 * - SummarizeSessionInput - The input type for the summarizeSession function.
 * - SummarizeSessionOutput - The return type for the summarizeSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSessionInputSchema = z.object({
  topic: z.string().describe('The main topic of the conversation.'),
  chatConversation: z
    .string()
    .describe('The complete chat conversation to summarize.'),
});
export type SummarizeSessionInput = z.infer<typeof SummarizeSessionInputSchema>;

const SummarizeSessionOutputSchema = z.object({
    summary: z.string().describe('A comma-separated list of 3-5 main keywords from the conversation.'),
});
export type SummarizeSessionOutput = z.infer<typeof SummarizeSessionOutputSchema>;

export async function summarizeSession(input: SummarizeSessionInput): Promise<SummarizeSessionOutput> {
  return summarizeSessionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSessionPrompt',
  input: {schema: SummarizeSessionInputSchema},
  output: {schema: SummarizeSessionOutputSchema},
  prompt: `You are an expert in summarizing conversations about {{{topic}}}.
  
  Given the following chat conversation, extract 3 to 5 of the most descriptive and distinct keywords that represent the specific concepts discussed.
  
  IMPORTANT: 
  - Do NOT include the main topic ("{{{topic}}}") or simple variations of it in your keywords.
  - Focus on specific terms, people, or concepts that were discussed within the topic.
  - Return the keywords as a single, comma-separated string.
  
  For example, if the topic is "Machine Learning" and the conversation is about decision trees and overfitting, a good summary would be "Decision Trees, Overfitting, Pruning, Supervised Learning". A bad summary would be "Machine Learning, AI, Learning".

  Chat Conversation:
  {{{chatConversation}}}`,
});

const summarizeSessionFlow = ai.defineFlow(
  {
    name: 'summarizeSessionFlow',
    inputSchema: SummarizeSessionInputSchema,
    outputSchema: SummarizeSessionOutputSchema,
  },
  async input => {
    // If the conversation is very short, return a default message instead of using the AI.
    if (input.chatConversation.length < 50) {
        return { summary: "New Session" };
    }
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to produce a summary.");
    }
    return output;
  }
);
