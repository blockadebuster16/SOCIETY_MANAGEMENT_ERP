import {
  createPreApproval as createPreApprovalService,
  listPreApprovals as listPreApprovalsService,
  cancelPreApproval as cancelPreApprovalService,
  checkInVisitor,
  checkOutVisitor,
  listActiveVisitors,
  listVisitorHistory,
  createSecurityLog,
  listSecurityLogs
} from '../services/visitorService.js';
import { getResidentProfile } from '../services/residentService.js';

const resolveUserId = async (authUserId) => {
  const profile = await getResidentProfile(authUserId);
  return profile.id;
};

// --- Pre-Approvals ---

export const createPreApproval = async (req, res, next) => {
  try {
    const userId = await resolveUserId(req.user.authUserId);
    const pass = await createPreApprovalService(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Visitor pre-approval registered successfully',
      pass
    });
  } catch (error) {
    next(error);
  }
};

export const getPreApprovals = async (req, res, next) => {
  try {
    const isAdminRole = ['committee_member', 'society_manager', 'super_admin', 'security'].includes(req.user.role);
    let userId = null;

    if (!isAdminRole) {
      userId = await resolveUserId(req.user.authUserId);
    }

    const passes = await listPreApprovalsService(userId);
    res.status(200).json({
      success: true,
      count: passes.length,
      passes
    });
  } catch (error) {
    next(error);
  }
};

export const cancelPreApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdminRole = ['committee_member', 'society_manager', 'super_admin', 'security'].includes(req.user.role);
    let userId = null;

    if (!isAdminRole) {
      userId = await resolveUserId(req.user.authUserId);
    }

    const pass = await cancelPreApprovalService(id, userId);
    res.status(200).json({
      success: true,
      message: 'Pre-approval cancelled successfully',
      pass
    });
  } catch (error) {
    next(error);
  }
};

// --- Check-In & Check-Out ---

export const checkIn = async (req, res, next) => {
  try {
    const guardUserId = await resolveUserId(req.user.authUserId);
    const entry = await checkInVisitor(req.body, guardUserId);
    res.status(201).json({
      success: true,
      message: 'Visitor checked in successfully',
      entry
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const guardUserId = await resolveUserId(req.user.authUserId);
    const entry = await checkOutVisitor(id, guardUserId, remarks);
    res.status(200).json({
      success: true,
      message: 'Visitor checked out successfully',
      entry
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveEntries = async (req, res, next) => {
  try {
    const active = await listActiveVisitors();
    res.status(200).json({
      success: true,
      count: active.length,
      active
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await listVisitorHistory(req.query);
    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

// --- Security Logs ---

export const createLog = async (req, res, next) => {
  try {
    const guardUserId = await resolveUserId(req.user.authUserId);
    const log = await createSecurityLog(req.body, guardUserId);
    res.status(201).json({
      success: true,
      message: 'Security operations log recorded successfully',
      log
    });
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    const logs = await listSecurityLogs(req.query);
    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};
