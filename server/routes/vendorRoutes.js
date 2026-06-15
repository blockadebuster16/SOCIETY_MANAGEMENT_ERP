import { Router } from 'express';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Fetch vendor registry list' });
});

router.post('/', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Add new vendor' });
});

router.get('/:id/contracts', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Fetch vendor contracts history' });
});

router.post('/:id/ratings', verifyToken, (req, res) => {
  res.status(201).json({ success: true, message: 'Submit vendor performance rating review' });
});

export default router;
