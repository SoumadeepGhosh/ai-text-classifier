import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value?: string, fallback = 3000): number => {
  const port = value ? parseInt(value, 10) : fallback;
  return isNaN(port) || port <= 0 || port > 65535 ? fallback : port;
};

const parsePositiveInt = (value?: string, fallback = 0): number => {
  const parsed = value ? parseInt(value, 10) : fallback;
  return isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

export const env = {
  PORT: parsePort(process.env.PORT, 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim() || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest',
  TIMEOUT_MS: parsePositiveInt(process.env.TIMEOUT_MS, 15000),
  MAX_INPUT_LENGTH: parsePositiveInt(process.env.MAX_INPUT_LENGTH, 5000),
  isProduction: (): boolean => process.env.NODE_ENV === 'production',
};
