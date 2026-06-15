import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';


// Middlewares
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve temporary local upload file uploads
app.use('/uploads', express.static('uploads'));

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/meetings', meetingRoutes);



// Root Ping Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Suyash Pride Portal API Scaffolding' });
});

// Central Error Handler Middleware
app.use(errorHandler);

const PORT = env.port;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in development mode`);
});
