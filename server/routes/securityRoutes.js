import { Router } from 'express';
import { verifyToken, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// Incidents
router.get('/incidents', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Fetch security incidents list' });
});

router.post('/incidents', verifyToken, (req, res) => {
  res.status(201).json({ success: true, message: 'Report security incident' });
});

router.patch('/incidents/:id', verifyToken, restrictTo('security', 'committee_member', 'super_admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Update security incident resolution' });
});

// Gate passes
router.get('/gate-passes', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'List gate passes' });
});

router.post('/gate-passes', verifyToken, (req, res) => {
  res.status(201).json({ success: true, message: 'Request gate pass' });
});

router.patch('/gate-passes/:id/approve', verifyToken, restrictTo('committee_member', 'society_manager', 'super_admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Approve gate pass' });
});

// Vehicle logs
router.post('/vehicles/log-entry', verifyToken, restrictTo('security', 'super_admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Log vehicle entry' });
});

router.patch('/vehicles/log-exit/:id', verifyToken, restrictTo('security', 'super_admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Log vehicle exit' });
});

// Deliveries
router.post('/deliveries/log', verifyToken, restrictTo('security', 'super_admin'), (req, res) => {
  res.status(201).json({ success: true, message: 'Log delivery partner entry' });
});

export default router;
