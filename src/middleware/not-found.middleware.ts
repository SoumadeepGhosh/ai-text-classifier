import { Request, Response } from 'express';
import { ClassifyErrorResponse } from '../types/classify.types';

export const notFoundHandler = (req: Request, res: Response<ClassifyErrorResponse>): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};
