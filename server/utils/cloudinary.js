import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file (from multer) to Cloudinary
 * @param {Object} file - The file object from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file, folder = 'suyash-pride') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        // Clean up the local file after upload if it exists
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
};

export default cloudinary;
