import { supabaseAdmin } from '../config/supabase.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';

export const getGalleryPhotos = async (req, res, next) => {
  try {
    const { data: photos, error } = await supabaseAdmin
      .from('gallery_images')
      .select(`
        id,
        title,
        description,
        image_url,
        file_size,
        created_at,
        album_id,
        gallery_albums(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      success: true,
      photos
    });
  } catch (error) {
    next(error);
  }
};

export const uploadGalleryPhoto = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Image files are required' });
    }

    const title = req.body.title || 'Untitled Photo';
    
    // Check for default album
    let { data: defaultAlbum, error: albumError } = await supabaseAdmin
      .from('gallery_albums')
      .select('id')
      .eq('name', 'General')
      .single();
      
    if (!defaultAlbum) {
      // Create 'General' album if it doesn't exist
      const { data: newAlbum, error: createError } = await supabaseAdmin
        .from('gallery_albums')
        .insert([{ name: 'General', description: 'General gallery photos' }])
        .select('id')
        .single();
        
      if (createError) throw new Error(createError.message);
      defaultAlbum = newAlbum;
    }

    // Process all files in parallel
    const uploadPromises = req.files.map(async (file, index) => {
      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file, 'suyash-pride/gallery');
      
      return {
        album_id: defaultAlbum.id,
        title: req.files.length > 1 ? `${title} - ${index + 1}` : title,
        image_url: imageUrl,
        file_size: file.size
      };
    });

    const photoInserts = await Promise.all(uploadPromises);

    // Save to database
    const { data: newPhotos, error: dbError } = await supabaseAdmin
      .from('gallery_images')
      .insert(photoInserts)
      .select();

    if (dbError) throw new Error(dbError.message);

    res.status(201).json({
      success: true,
      message: 'Photos uploaded successfully',
      photos: newPhotos
    });
  } catch (error) {
    next(error);
  }
};
