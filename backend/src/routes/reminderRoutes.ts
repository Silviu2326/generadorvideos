import { Router } from 'express';
import * as reminderController from '../controllers/reminderController';

const router = Router();

router.get('/', reminderController.getAllReminders);
router.post('/', reminderController.createReminder);
router.put('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

export default router;
