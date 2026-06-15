export const getGalleryPhotos = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get gallery photos placeholder success',
      photos: []
    });
  } catch (error) {
    next(error);
  }
};

export const uploadGalleryPhoto = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Upload gallery photo placeholder success',
      file: req.file ? req.file.originalname : null
    });
  } catch (error) {
    next(error);
  }
};
