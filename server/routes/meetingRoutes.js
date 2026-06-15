import { Router } from 'express';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Fetch meetings calendar list' });
});

router.post('/', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Schedule new board meeting' });
});

router.patch('/:id/minutes', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Log meeting minutes and resolutions' });
});

router.post('/:id/attendance', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Record meeting attendance sheet' });
});

export default router;
