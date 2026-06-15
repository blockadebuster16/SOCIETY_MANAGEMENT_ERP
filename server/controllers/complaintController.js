import {
  createComplaint as createComplaintService,
  updateComplaint as updateComplaintService,
  assignComplaint as assignComplaintService,
  changeComplaintStatus,
  closeComplaint as closeComplaintService,
  reopenComplaint as reopenComplaintService,
  addComment as addCommentService,
  uploadAttachment as uploadAttachmentService,
  getComplaintById,
  listComplaints
} from '../services/complaintService.js';
import { getResidentProfile } from '../services/residentService.js';
import { uploadFileToSupabase } from '../utils/storage.js';
import { logAudit } from '../services/auditService.js';

// Helper to get local user ID from req.user
const getLocalUserId = async (userPayload) => {
  const profile = await getResidentProfile(userPayload.authUserId);
  return profile.id;
};

export const getComplaints = async (req, res, next) => {
  try {
    const { category, status, priority, search, page, limit } = req.query;

    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const showAll = req.user && adminRoles.includes(req.user.role);
    
    let localUserId = null;
    if (!showAll) {
      localUserId = await getLocalUserId(req.user);
    }

    const result = await listComplaints({
      category,
      status,
      priority,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    }, showAll, localUserId);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await getComplaintById(id);

    // Enforce residents can only see their own complaints
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);
    if (!isAdmin) {
      const localUserId = await getLocalUserId(req.user);
      if (complaint.user_id !== localUserId) {
        return res.status(403).json({ success: false, message: 'Access Denied: You can only view your own complaints' });
      }
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req, res, next) => {
  try {
    const localUserId = await getLocalUserId(req.user);

    const complaintData = {
      ...req.body,
      residentId: localUserId
    };

    const complaint = await createComplaintService(complaintData);
    res.status(201).json({
      success: true,
      message: 'Complaint raised successfully',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await getComplaintById(id);

    // Verify ownership if not admin
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);
    if (!isAdmin) {
      const localUserId = await getLocalUserId(req.user);
      if (complaint.user_id !== localUserId) {
        return res.status(403).json({ success: false, message: 'Access Denied: You cannot edit other residents tickets' });
      }
      if (complaint.status !== 'Open') {
        return res.status(400).json({ success: false, message: 'Cannot edit complaint details after status is modified' });
      }
    }

    const updated = await updateComplaintService(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Complaint details updated successfully',
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const updated = await changeComplaintStatus(id, status, { resolutionNotes });
    const localUserId = await getLocalUserId(req.user);
    await logAudit(localUserId, 'UPDATE_COMPLAINT_STATUS', 'Complaint', id, { status, resolutionNotes });
    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

export const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const updated = await assignComplaintService(id, assignedTo);
    const localUserId = await getLocalUserId(req.user);
    await logAudit(localUserId, 'ASSIGN_COMPLAINT', 'Complaint', id, { assignedTo });
    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

export const closeComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const updated = await closeComplaintService(id, resolutionNotes);
    const localUserId = await getLocalUserId(req.user);
    await logAudit(localUserId, 'CLOSE_COMPLAINT', 'Complaint', id, { resolutionNotes });
    res.status(200).json({
      success: true,
      message: 'Complaint closed successfully',
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

export const reopenComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await getComplaintById(id);

    // Verify ownership if not admin
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);
    if (!isAdmin) {
      const localUserId = await getLocalUserId(req.user);
      if (complaint.user_id !== localUserId) {
        return res.status(403).json({ success: false, message: 'Access Denied: You cannot reopen other residents tickets' });
      }
    }

    const updated = await reopenComplaintService(id);
    const localUserId = await getLocalUserId(req.user);
    await logAudit(localUserId, 'REOPEN_COMPLAINT', 'Complaint', id);
    res.status(200).json({
      success: true,
      message: 'Complaint reopened successfully',
      complaint: updated
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    // Check permission: Residents can comment only on their own complaints
    const complaint = await getComplaintById(id);
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);
    const localUserId = await getLocalUserId(req.user);

    if (!isAdmin && complaint.user_id !== localUserId) {
      return res.status(403).json({ success: false, message: 'Access Denied: Cannot comment on other residents tickets' });
    }

    const newComment = await addCommentService(id, localUserId, comment);
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Attachment file is required' });
    }

    // Check permission: Residents can attach files only to their own complaints
    const complaint = await getComplaintById(id);
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);
    const localUserId = await getLocalUserId(req.user);

    if (!isAdmin && complaint.user_id !== localUserId) {
      return res.status(403).json({ success: false, message: 'Access Denied: Cannot add attachments to other residents tickets' });
    }

    // Upload to Supabase Storage complaint-attachments bucket
    const fileUrl = await uploadFileToSupabase(req.file, 'complaint-attachments');
    
    const attachment = await uploadAttachmentService(id, fileUrl, localUserId);

    res.status(201).json({
      success: true,
      message: 'Attachment uploaded successfully',
      attachment
    });
  } catch (error) {
    next(error);
  }
};

export const getMeComplaints = async (req, res, next) => {
  try {
    const localUserId = await getLocalUserId(req.user);
    const { category, status, priority, search, page, limit } = req.query;

    const result = await listComplaints({
      category,
      status,
      priority,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    }, false, localUserId);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
