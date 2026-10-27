import { Request, Response, NextFunction } from 'express';
import { validateClassifyPayload } from '../validators/classify.validator';
import { classifyService } from '../services/classify.service';
import { ClassifySuccessResponse } from '../types/classify.types';

/**
 * Controller to handle POST /api/classify.
 * Validates request payload, invokes classification service, and sends formatted response.
 */
export const classifyTextController = async (
  req: Request,
  res: Response<ClassifySuccessResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validate input
    const validatedText = validateClassifyPayload(req.body);

    // 2. Call service layer
    const result = await classifyService.classify(validatedText);

    // 3. Return response
    res.status(200).json({
      success: true,
      category: result.category,
      confidence: result.confidence,
    });
  } catch (error) {
    next(error);
  }
};

