import { listAuditLogs } from '../services/auditService.js';

/**
 * Handles HTTP requests to fetch compliance audit logs.
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await listAuditLogs(req.query);
    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};
