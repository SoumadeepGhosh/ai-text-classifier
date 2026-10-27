import { Router } from 'express';
import { classifyText } from '../controllers/classify.controller';

const router = Router();

router.post('/classify', classifyText);

export default router;
