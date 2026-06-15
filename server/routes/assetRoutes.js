import { Router } from 'express';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Fetch assets register' });
});

router.post('/', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Add new asset' });
});

router.get('/:id/history', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Fetch asset service history' });
});

router.post('/:id/history', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Log asset service record' });
});

export default router;
