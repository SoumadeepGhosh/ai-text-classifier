import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../validators/classify.validator';
import { ServiceError, TimeoutError, ModelResponseError } from '../services/classify.service';
import { ClassifyErrorResponse } from '../types/classify.types';
import { env } from '../config/env';

/**
 * Centralized error-handling middleware.
 * Intercepts all application errors, logs details, and formats standard HTTP error responses.
 * Guarantees the Express process never crashes due to unhandled route exceptions.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ClassifyErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // 1. Handle JSON parse error from express.json() body-parser
  if (err instanceof SyntaxError && 'status' in err && (err as { status: unknown }).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid JSON payload received in request body.',
        code: 'INVALID_JSON_BODY',
      },
    });
    return;
  }

  // 2. Handle request validation errors (missing field, empty string, oversized input, invalid types)
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  // 3. Handle AI Request Timeout errors
  if (err instanceof TimeoutError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: 'AI_TIMEOUT',
      },
    });
    return;
  }

  // 4. Handle invalid or unparseable AI model outputs
  if (err instanceof ModelResponseError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: 'INVALID_MODEL_OUTPUT',
      },
    });
    return;
  }

  // 5. Handle generic or specific service errors (e.g. Gemini API failure, quota, auth)
  if (err instanceof ServiceError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: 'SERVICE_ERROR',
      },
    });
    return;
  }

  // 6. Handle standard JavaScript errors or unexpected errors
  const isProd = env.isProduction();
  const errorMessage = err instanceof Error ? err.message : 'An unexpected internal error occurred.';

  // Always log unexpected errors to stderr for observability
  console.error('[Unhandled Internal Error]:', err);

  res.status(500).json({
    success: false,
    error: {
      message: isProd ? 'Internal server error.' : errorMessage,
      code: 'INTERNAL_SERVER_ERROR',
      ...(isProd ? {} : { details: err instanceof Error ? err.stack : undefined }),
    },
  });
};

