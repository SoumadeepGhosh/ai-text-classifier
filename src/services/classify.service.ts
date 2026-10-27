import { getGeminiClient } from '../config/gemini';
import { env } from '../config/env';
import { buildClassificationPrompt } from '../prompts/classification.prompt';
import { parseClassificationJson } from '../utils/parse-json';
import { ClassificationResult } from '../types/classify.types';

export class ServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

export class TimeoutError extends ServiceError {
  constructor(message = 'The AI classification request timed out.') {
    super(message, 504);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ModelResponseError extends ServiceError {
  constructor(message = 'The AI service returned an invalid or unparseable response.') {
    super(message, 502);
    this.name = 'ModelResponseError';
    Object.setPrototypeOf(this, ModelResponseError.prototype);
  }
}

/**
 * Service handling AI-assisted text classification.
 */
export class ClassifyService {
  /**
   * Classifies the input text into Complaint, Query, Feedback, or Other.
   *
   * @param text The cleaned input text to classify.
   * @returns ClassificationResult with category and confidence score.
   */
  public async classify(text: string): Promise<ClassificationResult> {
    const ai = getGeminiClient();
    const prompt = buildClassificationPrompt(text);

    // Setup timeout controller
    const timeoutMs = env.TIMEOUT_MS;
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort();
    }, timeoutMs);

    try {
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
        config: {
          abortSignal: abortController.signal,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new ModelResponseError('Gemini API returned an empty text response.');
      }

      return parseClassificationJson(responseText);
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        throw new TimeoutError(`AI classification request timed out after ${timeoutMs}ms.`);
      }

      // If already a recognized ServiceError (like ModelResponseError), rethrow
      if (err instanceof ServiceError) {
        throw err;
      }

      // Check if error is from JSON parser
      if (err instanceof Error && err.message.includes('Failed to parse model output')) {
        throw new ModelResponseError(err.message);
      }

      // Format Gemini API / network errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown AI service failure';
      
      // Check for common Gemini API errors (e.g., invalid key, quota, rate limiting)
      if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
        throw new ServiceError('Invalid Gemini API key provided. Please verify your GEMINI_API_KEY.', 401);
      }

      if (errorMessage.includes('Resource has been exhausted') || errorMessage.includes('QUOTA_EXCEEDED')) {
        throw new ServiceError('Gemini API quota exceeded. Please try again later or check your billing plan.', 429);
      }

      throw new ServiceError(`Gemini AI service error: ${errorMessage}`, 502);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

// Export singleton service instance
export const classifyService = new ClassifyService();

