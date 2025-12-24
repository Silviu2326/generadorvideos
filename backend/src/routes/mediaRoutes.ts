import { Router } from 'express';
import * as mediaController from '../controllers/mediaController';

const router = Router();

router.get('/', mediaController.getAllAssets);
router.post('/', mediaController.createAsset);
router.delete('/:id', mediaController.deleteAsset);
router.get('/folders', mediaController.getFolders);
router.post('/upload-intent', mediaController.uploadIntent);

export default router;
