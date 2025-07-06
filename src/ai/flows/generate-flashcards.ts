// src/ai/flows/generate-flashcards.ts
'use server';

/**
 * @fileOverview A flow to generate flashcards from a chat conversation.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  chatConversation: z
    .string()
    .describe('The complete chat conversation to generate flashcards from.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.array(z.object({
  question: z.string().describe('The question for the flashcard.'),
  answer: z.string().describe('The answer to the question.'),
}));
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert tutor, skilled at extracting key concepts from conversations and turning them into effective flashcards.

  Given the following chat conversation, identify the most important concepts and create a set of flashcards to help the student review them.
  Each flashcard should have a question and a concise answer.

  Format your response as a JSON array of objects, where each object has a "question" and "answer" field.

  Chat Conversation:
  {{chatConversation}}`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model failed to produce an output that matched the required format.");
    }
    return output;
  }
);