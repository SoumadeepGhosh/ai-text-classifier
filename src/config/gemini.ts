import { GoogleGenAI } from '@google/genai';
import { env } from './env';

/**
 * Singleton Gemini client instance.
 * Ensures the GoogleGenAI SDK client is only initialized once across the entire application lifecycle.
 */
let geminiClientInstance: GoogleGenAI | null = null;

/**
 * Retrieves the reusable singleton Gemini API client.
 * Validates the API key before initialization.
 */
export const getGeminiClient = (): GoogleGenAI => {
  if (!geminiClientInstance) {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined. Please configure GEMINI_API_KEY in your .env file.'
      );
    }

    geminiClientInstance = new GoogleGenAI({
      apiKey,
    });
  }

  return geminiClientInstance;
};

