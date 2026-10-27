import { Request, Response, NextFunction } from 'express';
import { validateClassifyPayload } from '../validators/classify.validator';
import { classifyService } from '../services/classify.service';
import { ClassifySuccessResponse } from '../types/classify.types';

export const classifyText = async (
  req: Request,
  res: Response<ClassifySuccessResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const text = validateClassifyPayload(req.body);
    const classification = await classifyService.classify(text);

    res.status(200).json({
      success: true,
      category: classification.category,
      confidence: classification.confidence,
    });
  } catch (error) {
    next(error);
  }
};
