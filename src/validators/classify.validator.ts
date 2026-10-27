import { env } from '../config/env';

export class ValidationError extends Error {
  public readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export const validateClassifyPayload = (body: unknown): string => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Request body must be a valid JSON object.');
  }

  const payload = body as Record<string, unknown>;

  if (!('text' in payload) || payload['text'] === undefined || payload['text'] === null) {
    throw new ValidationError("Missing required field: 'text'.");
  }

  const text = payload['text'];

  if (typeof text !== 'string') {
    throw new ValidationError("The 'text' field must be a string.");
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    throw new ValidationError("The 'text' field cannot be empty.");
  }

  const maxLength = env.MAX_INPUT_LENGTH;
  if (text.length > maxLength) {
    throw new ValidationError(
      `Input text length (${text.length}) exceeds the maximum allowed length of ${maxLength} characters.`
    );
  }

  return trimmed;
};
