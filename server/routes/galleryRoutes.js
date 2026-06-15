import { Router } from 'express';
import { 
  getGalleryPhotos, 
  uploadGalleryPhoto,
  getGalleryPosts,
  createGalleryPost,
  updateGalleryPost,
  deleteGalleryPost
} from '../controllers/galleryController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();

router.get('/', cacheMiddleware(3600), getGalleryPhotos);
router.post('/upload', upload.array('images', 10), uploadGalleryPhoto);

// New Post-based endpoints
router.get('/posts', getGalleryPosts);
router.post('/posts', upload.array('images', 10), createGalleryPost);
router.patch('/posts/:id', upload.array('images', 10), updateGalleryPost);
router.delete('/posts/:id', deleteGalleryPost);

export default router;
