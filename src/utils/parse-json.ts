import { ClassificationCategory, ClassificationResult } from '../types/classify.types';
import { VALID_CATEGORIES } from '../prompts/classification.prompt';

/**
 * Strips markdown code blocks and trailing/leading whitespace from model outputs.
 */
export const extractCleanJsonString = (raw: string): string => {
  let cleaned = raw.trim();

  // Remove markdown code fences like ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  return cleaned.trim();
};

/**
 * Safely parses the raw string response from Gemini into a verified ClassificationResult.
 * Ensures the response strictly contains a valid category and a confidence number between 0 and 1.
 */
export const parseClassificationJson = (rawText: string): ClassificationResult => {
  if (!rawText || rawText.trim() === '') {
    throw new Error('Gemini API returned an empty response.');
  }

  const cleaned = extractCleanJsonString(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const originalMessage = err instanceof Error ? err.message : 'Unknown JSON syntax error';
    throw new Error(`Failed to parse model output as JSON: ${originalMessage}. Raw output was: "${rawText}"`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Parsed model response is not a valid JSON object.');
  }

  const candidate = parsed as Record<string, unknown>;

  const category = candidate['category'];
  if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category as ClassificationCategory)) {
    throw new Error(
      `Invalid category "${String(category)}" returned by model. Expected one of: ${VALID_CATEGORIES.join(', ')}`
    );
  }

  const rawConfidence = candidate['confidence'];
  let confidence: number;

  if (typeof rawConfidence === 'number') {
    confidence = rawConfidence;
  } else if (typeof rawConfidence === 'string') {
    confidence = parseFloat(rawConfidence);
  } else {
    throw new Error('Missing or invalid "confidence" field in model output.');
  }

  if (isNaN(confidence) || confidence < 0 || confidence > 1) {
    throw new Error(`Confidence score must be a number between 0.00 and 1.00, received: ${confidence}`);
  }

  // Round confidence to 2 decimal places for clean, consistent output
  const roundedConfidence = Math.round(confidence * 100) / 100;

  return {
    category: category as ClassificationCategory,
    confidence: roundedConfidence,
  };
};

