import { config } from 'dotenv';
config();

import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/ai-tutor.ts';
import '@/ai/flows/summarize-session.ts';
