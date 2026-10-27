import { ClassificationCategory, ClassificationResult } from '../types/classify.types';
import { VALID_CATEGORIES } from '../prompts/classification.prompt';

const stripMarkdownFences = (raw: string): string => {
  let cleaned = raw.trim();

  // Strip markdown code fences if the model wraps JSON in backticks.
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  return cleaned.trim();
};

export const parseClassificationJson = (rawText: string): ClassificationResult => {
  if (!rawText || rawText.trim() === '') {
    throw new Error('Gemini API returned an empty response.');
  }

  const cleaned = stripMarkdownFences(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown JSON syntax error';
    throw new Error(`Failed to parse model output as JSON: ${message}. Raw output was: "${rawText}"`);
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

  return {
    category: category as ClassificationCategory,
    confidence: Math.round(confidence * 100) / 100,
  };
};
