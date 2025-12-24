import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { authMiddleware as auth } from '../middlewares/auth';

const router = Router();

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', auth, projectController.createProject);
router.put('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);

export default router;