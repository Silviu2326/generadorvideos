import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';

const router = Router();

router.get('/stats', analyticsController.getPlatformStats);
router.get('/chart', analyticsController.getChartData);
router.get('/recent-posts', analyticsController.getRecentPosts);
router.get('/demographics', analyticsController.getDemographics);
router.get('/top-countries', analyticsController.getTopCountries);

export default router;
