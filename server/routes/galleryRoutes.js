import { Router } from 'express';
import { getGalleryPhotos, uploadGalleryPhoto } from '../controllers/galleryController.js';

const router = Router();

router.get('/', getGalleryPhotos);
router.post('/upload', uploadGalleryPhoto);

export default router;
