import { supabaseAdmin } from '../config/supabase.js';

const getStorageFileName = (fileUrl) => {
  const parts = fileUrl.split('/society-documents/');
  return parts.length > 1 ? parts[1] : fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
};

export const uploadDocument = async (docData) => {
  const { categoryId, title, description, fileUrl, fileSize, mimeType, uploadedBy, status } = docData;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .insert([
      {
        category_id: categoryId,
        title,
        description: description || null,
        file_url: fileUrl,
        file_size: fileSize || null,
        mime_type: mimeType || null,
        version: 1,
        status: status || 'Published',
        uploaded_by: uploadedBy || null
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const replaceDocument = async (docId, replaceData) => {
  // Retrieve current version
  const { data: current, error: fetchErr } = await supabaseAdmin
    .from('documents')
    .select('version, file_url')
    .eq('id', docId)
    .single();

  if (fetchErr || !current) {
    throw new Error('Document not found');
  }

  const newVersion = current.version + 1;

  let updates = { version: newVersion };
  if (replaceData.title !== undefined) updates.title = replaceData.title;
  if (replaceData.description !== undefined) updates.description = replaceData.description;
  if (replaceData.categoryId !== undefined) updates.category_id = replaceData.categoryId;
  if (replaceData.fileUrl !== undefined) updates.file_url = replaceData.fileUrl;
  if (replaceData.fileSize !== undefined) updates.file_size = replaceData.fileSize;
  if (replaceData.mimeType !== undefined) updates.mime_type = replaceData.mimeType;
  if (replaceData.status !== undefined) updates.status = replaceData.status;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .update(updates)
    .eq('id', docId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Delete older file from storage to keep buckets optimized
  if (replaceData.fileUrl && current.file_url !== replaceData.fileUrl) {
    const oldFileName = getStorageFileName(current.file_url);
    try {
      await supabaseAdmin.storage.from('society-documents').remove([oldFileName]);
    } catch (removeErr) {
      console.error('Failed to remove replaced file from storage:', removeErr);
    }
  }

  return data;
};

export const archiveDocument = async (docId) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .update({ status: 'Archived' })
    .eq('id', docId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) {
    const err = new Error('Document not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const deleteDocument = async (docId) => {
  // Retrieve file URL to delete file asset from storage
  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from('documents')
    .select('file_url')
    .eq('id', docId)
    .single();

  if (fetchErr || !doc) {
    const err = new Error('Document not found');
    err.statusCode = 404;
    throw err;
  }

  // Delete record from DB
  const { error: dbError } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', docId);

  if (dbError) throw new Error(dbError.message);

  // Delete file asset from storage
  const fileName = getStorageFileName(doc.file_url);
  try {
    await supabaseAdmin.storage.from('society-documents').remove([fileName]);
  } catch (removeErr) {
    console.error('Failed to delete storage file on document deletion:', removeErr);
  }

  return { success: true };
};

export const getDocumentById = async (docId) => {
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('*, document_categories(*), uploaded_by(id, first_name, last_name, email, role)')
    .eq('id', docId)
    .single();

  if (error || !data) {
    const err = new Error('Document not found');
    err.statusCode = 404;
    throw err;
  }
  return data;
};

export const listDocuments = async (filters = {}, showAll = false) => {
  const { categoryId, search, page = 1, limit = 10 } = filters;

  let query = supabaseAdmin
    .from('documents')
    .select('*, document_categories(*), uploaded_by(id, first_name, last_name, email, role)', { count: 'exact' });

  if (!showAll) {
    query = query.eq('status', 'Published');
  } else if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    documents: data,
    total: count,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
};

export const downloadDocument = async (docId) => {
  const doc = await getDocumentById(docId);
  const fileName = getStorageFileName(doc.file_url);

  // Generate short-lived signed URL for download (valid for 60 seconds)
  const { data, error } = await supabaseAdmin.storage
    .from('society-documents')
    .createSignedUrl(fileName, 60);

  if (error) {
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }

  return data.signedUrl;
};

export const getDocumentsByCategory = async (categoryId, showAll = false) => {
  let query = supabaseAdmin
    .from('documents')
    .select('*, document_categories(*), uploaded_by(id, first_name, last_name, email, role)')
    .eq('category_id', categoryId);

  if (!showAll) {
    query = query.eq('status', 'Published');
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return data;
};
