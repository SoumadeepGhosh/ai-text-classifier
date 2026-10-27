import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../validators/classify.validator';
import { ServiceError, TimeoutError, ModelResponseError } from '../services/classify.service';
import { ClassifyErrorResponse } from '../types/classify.types';
import { env } from '../config/env';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ClassifyErrorResponse>,
  // NextFunction parameter is required so Express recognizes this as an error-handling middleware.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Catch malformed JSON payloads rejected by Express body-parser.
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

  const isProd = env.isProduction();
  const errorMessage = err instanceof Error ? err.message : 'An unexpected internal error occurred.';

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
