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

// --- New Post-based Controllers ---

export const getGalleryPosts = async (req, res, next) => {
  try {
    const { isAdmin } = req.query; // If admin, return all (draft, scheduled). Else only deployed.
    
    let query = supabaseAdmin
      .from('gallery_albums')
      .select(`
        id,
        name,
        description,
        status,
        publish_date,
        created_at,
        gallery_images (
          id,
          image_url,
          title
        )
      `)
      .order('publish_date', { ascending: false });

    // If not requesting as admin, only show deployed or scheduled that have passed their publish_date
    if (isAdmin !== 'true') {
      // Supabase PostgREST allows chaining or using or() but it's simpler to filter where status = Deployed or (status=Scheduled and publish_date <= now)
      query = query.or(`status.eq.Deployed,and(status.eq.Scheduled,publish_date.lte.now())`);
    }

    const { data: posts, error } = await query;

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    next(error);
  }
};

export const createGalleryPost = async (req, res, next) => {
  try {
    const { title, description, status, publish_date } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Post title is required' });
    }

    // Insert the Album / Post
    const { data: post, error: postError } = await supabaseAdmin
      .from('gallery_albums')
      .insert([{
        name: title,
        description: description || '',
        status: status || 'Deployed',
        publish_date: publish_date || new Date().toISOString()
      }])
      .select()
      .single();

    if (postError) throw new Error(postError.message);

    // If there are files, upload them
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file, index) => {
        const imageUrl = await uploadImageToCloudinary(file, 'suyash-pride/gallery');
        return {
          album_id: post.id,
          title: req.files.length > 1 ? `${title} - ${index + 1}` : title,
          image_url: imageUrl,
          file_size: file.size
        };
      });

      const photoInserts = await Promise.all(uploadPromises);
      const { error: dbError } = await supabaseAdmin
        .from('gallery_images')
        .insert(photoInserts);

      if (dbError) throw new Error(dbError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

export const updateGalleryPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, publish_date } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.name = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (publish_date !== undefined) updateData.publish_date = publish_date;
    
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('gallery_albums')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw new Error(updateError.message);
    }

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file, index) => {
        const imageUrl = await uploadImageToCloudinary(file, 'suyash-pride/gallery');
        return {
          album_id: id,
          title: title || 'Appended Image',
          image_url: imageUrl,
          file_size: file.size
        };
      });

      const photoInserts = await Promise.all(uploadPromises);
      const { error: dbError } = await supabaseAdmin
        .from('gallery_images')
        .insert(photoInserts);

      if (dbError) throw new Error(dbError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('gallery_albums')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
