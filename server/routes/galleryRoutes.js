import { Router } from 'express';
import { getGalleryPhotos, uploadGalleryPhoto } from '../controllers/galleryController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();

router.get('/', cacheMiddleware(3600), getGalleryPhotos);
router.post('/upload', upload.array('images', 10), uploadGalleryPhoto);

export default router;
