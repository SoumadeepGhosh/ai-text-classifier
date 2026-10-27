import { Router } from 'express';
import { classifyTextController } from '../controllers/classify.controller';

const router = Router();

/**
 * @route   POST /api/classify
 * @desc    Classify user input text into Complaint, Query, Feedback, or Other
 * @access  Public
 */
router.post('/classify', classifyTextController);

export default router;

