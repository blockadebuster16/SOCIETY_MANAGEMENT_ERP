import fs from 'fs';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Uploads a local file (parsed by multer diskStorage) to a Supabase Storage bucket,
 * and deletes the local temporary file afterwards.
 * @param {Object} file - The Express Multer file object
 * @param {string} bucketName - Target Supabase bucket
 * @returns {Promise<string>} - The public URL of the uploaded asset
 */
export const uploadFileToSupabase = async (file, bucketName) => {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  
  // Read local file into buffer
  const fileBuffer = fs.readFileSync(file.path);

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    // Attempt local file cleanup even on upload error
    try {
      fs.unlinkSync(file.path);
    } catch (unlinkErr) {
      console.error('Failed to delete temp file on upload error:', unlinkErr);
    }
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  // Clean up local temp file
  try {
    fs.unlinkSync(file.path);
  } catch (unlinkErr) {
    console.error('Failed to delete temp file:', unlinkErr);
  }

  return urlData.publicUrl;
};
