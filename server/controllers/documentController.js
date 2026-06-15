import {
  uploadDocument as uploadDocService,
  replaceDocument as replaceDocService,
  archiveDocument as archiveDocService,
  deleteDocument as deleteDocService,
  getDocumentById,
  listDocuments,
  downloadDocument as downloadDocService,
  getDocumentsByCategory as getDocsByCategoryService
} from '../services/documentService.js';
import { uploadFileToSupabase } from '../utils/storage.js';
import { logAudit } from '../services/auditService.js';

export const getDocuments = async (req, res, next) => {
  try {
    const { categoryId, search, page, limit, status } = req.query;

    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const showAll = req.user && adminRoles.includes(req.user.role);

    const result = await listDocuments({
      categoryId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status
    }, showAll);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await getDocumentById(id);

    // Enforce residents can only see published files
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);
    if (!isAdmin && document.status !== 'Published') {
      return res.status(403).json({ success: false, message: 'Access Denied: Document is not published' });
    }

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const showAll = req.user && adminRoles.includes(req.user.role);

    const documents = await getDocsByCategoryService(categoryId, showAll);
    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File upload is required' });
    }

    // Upload to Supabase Storage
    const fileUrl = await uploadFileToSupabase(req.file, 'society-documents');

    const docData = {
      ...req.body,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id
    };

    const document = await uploadDocService(docData);
    await logAudit(req.user.id, 'UPLOAD_DOCUMENT', 'Document', document.id, { title: document.title });
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    let fileUrl = req.body.fileUrl;
    let fileSize = req.body.fileSize;
    let mimeType = req.body.mimeType;

    if (req.file) {
      fileUrl = await uploadFileToSupabase(req.file, 'society-documents');
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    }

    const replaceData = {
      ...req.body,
      fileUrl,
      fileSize,
      mimeType
    };

    const document = await replaceDocService(id, replaceData);
    await logAudit(req.user.id, 'REPLACE_DOCUMENT', 'Document', document.id, { title: document.title });
    res.status(200).json({
      success: true,
      message: 'Document replaced/updated successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const archiveDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await archiveDocService(id);
    await logAudit(req.user.id, 'ARCHIVE_DOCUMENT', 'Document', document.id, { title: document.title });
    res.status(200).json({
      success: true,
      message: 'Document archived successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteDocService(id);
    await logAudit(req.user.id, 'DELETE_DOCUMENT', 'Document', id, { documentId: id });
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check access rules
    const document = await getDocumentById(id);
    const adminRoles = ['committee_member', 'society_manager', 'super_admin'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);
    if (!isAdmin && document.status !== 'Published') {
      return res.status(403).json({ success: false, message: 'Access Denied: Cannot download unpublished documents' });
    }

    const downloadUrl = await downloadDocService(id);
    res.status(200).json({
      success: true,
      downloadUrl
    });
  } catch (error) {
    next(error);
  }
};
