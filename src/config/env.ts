import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  TIMEOUT_MS: number;
  MAX_INPUT_LENGTH: number;
}

/**
 * Validates and returns the application environment configuration.
 * Throws a descriptive error if mandatory configuration is missing.
 */
export const getEnvConfig = (): EnvironmentConfig => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'Missing required environment variable: GEMINI_API_KEY. ' +
      'Please add your Gemini API key to the .env file.'
    );
  }

  const rawPort = process.env.PORT;
  const port = rawPort ? parseInt(rawPort, 10) : 3000;
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT: "${rawPort}". PORT must be a number between 1 and 65535.`);
  }

  const rawTimeout = process.env.TIMEOUT_MS;
  const timeoutMs = rawTimeout ? parseInt(rawTimeout, 10) : 15000;

  const rawMaxLength = process.env.MAX_INPUT_LENGTH;
  const maxInputLength = rawMaxLength ? parseInt(rawMaxLength, 10) : 5000;

  return {
    PORT: port,
    NODE_ENV: process.env.NODE_ENV || 'development',
    GEMINI_API_KEY: apiKey,
    GEMINI_MODEL: process.env.GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest',
    TIMEOUT_MS: isNaN(timeoutMs) ? 15000 : timeoutMs,
    MAX_INPUT_LENGTH: isNaN(maxInputLength) ? 5000 : maxInputLength,
  };
};

/**
 * Environment accessor object.
 */
export const env = {
  get PORT(): number {
    const raw = process.env.PORT;
    const parsed = raw ? parseInt(raw, 10) : 3000;
    return isNaN(parsed) ? 3000 : parsed;
  },
  get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  },
  get GEMINI_API_KEY(): string {
    return process.env.GEMINI_API_KEY?.trim() || '';
  },
  get GEMINI_MODEL(): string {
    return process.env.GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest';
  },
  get TIMEOUT_MS(): number {
    const raw = process.env.TIMEOUT_MS;
    const parsed = raw ? parseInt(raw, 10) : 15000;
    return isNaN(parsed) ? 15000 : parsed;
  },
  get MAX_INPUT_LENGTH(): number {
    const raw = process.env.MAX_INPUT_LENGTH;
    const parsed = raw ? parseInt(raw, 10) : 5000;
    return isNaN(parsed) ? 5000 : parsed;
  },
  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },
  validate(): void {
    getEnvConfig();
  },
};
