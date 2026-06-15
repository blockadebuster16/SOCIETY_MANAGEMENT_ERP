# Routing Architecture

## Frontend Routing Map

Client-side routes are managed by `react-router-dom` in `client/src/routes/AppRoutes.jsx` and guarded with specialized layout filters.

### 1. Public Routes (`PublicLayout.jsx`)
- `/` - Landing Page
- `/about` - About the society, management committee structure
- `/contact` - Official inquiry form and location maps
- `/gallery` - Photo gallery of society infrastructure and events
- `/events` - Public event calendar
- `/events/:id` - Specific event detailed page
- `/notices` - Official announcement list
- `/notices/:id` - Details page for a specific notice
- `/downloads` - Access to blank application forms, NOC formats
- `/floor-plans` - Layout maps of towers
- `/chat-assistant` - Guest chatbot assistant
- `/login` - Credential sign-in page

### 2. Resident Protected Routes (`ResidentLayout.jsx` + `ProtectedRoute.jsx`)
- `/resident/dashboard` - Billing summaries, active complaints, quick links
- `/resident/profile` - Personal profile details, vehicle registers
- `/resident/documents` - Private registry files (share certificates, registry deeds)
- `/resident/downloads` - Download files
- `/resident/complaints` - Maintenance ticket reporting list
- `/resident/complaints/:id` - Dynamic tracker and message logs for the complaint
- `/resident/payments` - Maintenance invoices and Razorpay portal link
- `/resident/payment-history` - Historic transaction ledger
- `/resident/events` - Active events and RSVPs
- `/resident/chatbot` - AI Assistant for residents
- `/resident/settings` - Language, contact updates, notification switches

### 3. Committee Admin Protected Routes (`AdminLayout.jsx` + `AdminRoute.jsx`)
- `/admin/dashboard` - Overview statistics (complaints resolution rate, collection tracking)
- `/admin/notices` - Notice table
- `/admin/notices/new` - Create official notice
- `/admin/notices/:id/edit` - Edit notice content
- `/admin/documents` - System file folder manager
- `/admin/documents/upload` - File uploader for public/private documents
- `/admin/events` - Event dashboard
- `/admin/events/new` - Register new upcoming event
- `/admin/events/:id/edit` - Modify event details
- `/admin/complaints` - Review all resident complaints and update status
- `/admin/residents` - Manage society resident database, verify profiles
- `/admin/payments` - Record manual payment credits and inspect invoices
- `/admin/gallery` - Upload photos to society gallery
- `/admin/chatbot-training` - Interface to upload FAQs for AI training

### 4. Super Admin Protected Routes (`SuperAdminLayout.jsx` + `SuperAdminRoute.jsx`)
- `/superadmin/dashboard` - Hardware metrics, database size, license info
- `/superadmin/users` - Add/remove portal access, unlock accounts
- `/superadmin/roles` - Assign Committee Admin/Resident permissions
- `/superadmin/storage` - Audit bucket sizes and delete orphan file uploads
- `/superadmin/audit-logs` - Inspect logs of API requests and sensitive user actions
- `/superadmin/settings` - System-wide site configuration

---

## Backend Routing Map

All backend routes are prefixed with `/api` and mounted in `server/server.js`:
- `/api/auth` -> `authRoutes.js`
- `/api/notices` -> `noticeRoutes.js`
- `/api/documents` -> `documentRoutes.js`
- `/api/events` -> `eventRoutes.js`
- `/api/complaints` -> `complaintRoutes.js`
- `/api/payments` -> `paymentRoutes.js`
- `/api/residents` -> `residentRoutes.js`
- `/api/gallery` -> `galleryRoutes.js`
- `/api/chatbot` -> `chatbotRoutes.js`
