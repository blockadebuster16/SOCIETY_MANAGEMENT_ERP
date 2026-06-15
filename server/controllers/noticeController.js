import {
  createNotice as createNoticeService,
  updateNotice as updateNoticeService,
  publishNotice as publishNoticeService,
  archiveNotice as archiveNoticeService,
  deleteNotice as deleteNoticeService,
  getNoticeById,
  listNotices,
  getLatestNotices
} from '../services/noticeService.js';
import { uploadFileToSupabase } from '../utils/storage.js';
import { logAudit } from '../services/auditService.js';

export const getNotices = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    
    // Check if user is admin to see all drafts/scheduled notices
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const showAll = req.user && adminRoles.includes(req.user.role);

    const notices = await listNotices({ category, status, search }, showAll);
    res.status(200).json({
      success: true,
      count: notices.length,
      notices
    });
  } catch (error) {
    next(error);
  }
};

export const getLatest = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    const notices = await getLatestNotices(limit);
    res.status(200).json({
      success: true,
      count: notices.length,
      notices
    });
  } catch (error) {
    next(error);
  }
};

export const getNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await getNoticeById(id);
    res.status(200).json({
      success: true,
      notice
    });
  } catch (error) {
    next(error);
  }
};

export const createNotice = async (req, res, next) => {
  try {
    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = await uploadFileToSupabase(req.file, 'notice-attachments');
    }

    const noticeData = {
      ...req.body,
      attachmentUrl,
      publishedBy: req.user.id // Link notice creator to local users table ID
    };

    const notice = await createNoticeService(noticeData);
    await logAudit(req.user.id, 'CREATE_NOTICE', 'Notice', notice.id, { title: notice.title });
    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      notice
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    let attachmentUrl = req.body.attachmentUrl;
    
    if (req.file) {
      attachmentUrl = await uploadFileToSupabase(req.file, 'notice-attachments');
    }

    const updateData = {
      ...req.body,
      attachmentUrl
    };

    const notice = await updateNoticeService(id, updateData);
    await logAudit(req.user.id, 'UPDATE_NOTICE', 'Notice', notice.id, { title: notice.title });
    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    next(error);
  }
};

export const publishNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await publishNoticeService(id);
    await logAudit(req.user.id, 'PUBLISH_NOTICE', 'Notice', notice.id, { title: notice.title });
    res.status(200).json({
      success: true,
      message: 'Notice published successfully',
      notice
    });
  } catch (error) {
    next(error);
  }
};

export const archiveNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await archiveNoticeService(id);
    await logAudit(req.user.id, 'ARCHIVE_NOTICE', 'Notice', notice.id, { title: notice.title });
    res.status(200).json({
      success: true,
      message: 'Notice archived successfully',
      notice
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteNoticeService(id);
    await logAudit(req.user.id, 'DELETE_NOTICE', 'Notice', id, { noticeId: id });
    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
