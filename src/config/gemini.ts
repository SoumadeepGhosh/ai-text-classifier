import { GoogleGenAI } from '@google/genai';
import { env } from './env';

// Reuse a single client instance across requests.
let client: GoogleGenAI | null = null;

export const getGeminiClient = (): GoogleGenAI => {
  if (!client) {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined. Please configure it in your .env file.');
    }

    client = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }

  return client;
};
