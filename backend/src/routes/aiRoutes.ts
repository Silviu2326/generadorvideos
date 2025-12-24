import { Router } from 'express';
import * as aiController from '../controllers/aiController';

const router = Router();

router.post('/generate-script', aiController.generateScript);
router.post('/project/generate-full', aiController.generateFullProject);
router.post('/project/generate-visuals', aiController.generateVisuals);
router.post('/project/generate-audio', aiController.generateAudio);

export default router;
