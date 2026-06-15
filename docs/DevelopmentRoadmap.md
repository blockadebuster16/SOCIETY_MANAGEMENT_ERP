# Detailed Backend Development Roadmap

This document outlines the step-by-step implementation roadmap for the **Suyash Pride Portal** backend, structured into 11 distinct development milestones.

---

## Milestone 1: Authentication

### A. Folder Structure
```text
server/
├── controllers/authController.js
├── routes/authRoutes.js
├── services/authService.js
├── middleware/authMiddleware.js
└── validators/authValidator.js
```

### B. Services
- **`registerUser(email, password, firstName, lastName)`**: Interfaces with Supabase Auth to register user credentials and inserts a profile record into the `users` table.
- **`authenticateUser(email, password)`**: Verifies user login and issues a signed JWT containing `id`, `email`, and `role`.
- **`fetchUserProfile(userId)`**: Retrieves user profile metrics.

### C. Controllers
- `register`: Maps registration payload to registration service and returns `201 Created` with JWT.
- `login`: Maps email/password to authentication service and returns `200 OK` with JWT.
- `getProfile`: Resolves the logged-in user context and returns the profile details.

### D. Routes
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile`

### E. Middleware
- **`verifyToken`**: Parses `Authorization: Bearer <token>` header, decodes the JWT, and binds payload to `req.user`.

### F. Validation
- Email format regex validation.
- Password minimum length checks (>= 6 characters).

### G. Testing
- Integration tests using Supertest/Jest:
  - Verify `201 Created` for valid registrations.
  - Verify `401 Unauthorized` for incorrect credentials.
  - Verify `400 Bad Request` for invalid email formats.

---

## Milestone 2: Property Management

### A. Folder Structure
```text
server/
├── controllers/propertyController.js
├── routes/propertyRoutes.js
├── services/propertyService.js
└── validators/propertyValidator.js
```

### B. Services
- **`listProperties(filters)`**: Queries the `properties` table, grouping by `wing_id` or `unit_type`.
- **`updatePropertyStatus(propertyId, status)`**: Alters the unit's active/maintenance status.

### C. Controllers
- `getProperties`: Maps query parameters (wingId, unitType) and returns filtered properties list.
- `modifyPropertyStatus`: Alters active status and records changes.

### D. Routes
- `GET /api/v1/properties`
- `PATCH /api/v1/properties/:id/status`

### E. Middleware
- `restrictTo('committee_member', 'society_manager', 'super_admin')` on status updates.

### F. Validation
- `id` parameter must be a valid UUID.
- `status` parameter must be one of `['Active', 'Under Maintenance', 'Inactive']`.

### G. Testing
- Confirm query returns all 137 properties (112 residential, 25 commercial) on fresh seed.

---

## Milestone 3: Resident Management

### A. Folder Structure
```text
server/
├── controllers/residentController.js
├── routes/residentRoutes.js
├── services/residentService.js
└── validators/residentValidator.js
```

### B. Services
- **`onboardTenant(propertyId, tenantData)`**: Inserts lease duration details in `tenants` and sets unit status to `Rented`.
- **`registerVehicle(propertyId, vehicleData)`**: Adds vehicle stickers to `vehicles`.

### C. Controllers
- `addTenant`: Creates active lease agreements.
- `addVehicle`: Adds parking logs to properties.

### D. Routes
- `POST /api/v1/residents/tenants`
- `POST /api/v1/residents/vehicles`

### E. Middleware
- verifyToken.

### F. Validation
- Vehicle number must match standard format regex (e.g., `MH-46-XX-XXXX`).
- Lease start and end dates validation.

### G. Testing
- Verify lease start dates are prior to end dates.
- Test unique vehicle number constraints.

---

## Milestone 4: Notice Management

### A. Folder Structure
```text
server/
├── controllers/noticeController.js
├── routes/noticeRoutes.js
├── services/noticeService.js
└── validators/noticeValidator.js
```

### B. Services
- **`broadcastNotice(noticeData)`**: Inserts notice details and triggers email updates to residents.
- **`archiveNotice(noticeId)`**: Sets notice status to `Archived`.

### C. Controllers
- `createNotice`: Broadcasts announcements.
- `deleteNotice`: Removes or archives notices.

### D. Routes
- `GET /api/v1/notices`
- `POST /api/v1/notices`
- `PUT /api/v1/notices/:id`

### E. Middleware
- Restricted write access to admins.

### F. Validation
- Notice title and body required fields, category checks.

### G. Testing
- Verify pinned notices appear first in list payload.

---

## Milestone 5: Document Management

### A. Folder Structure
```text
server/
├── controllers/documentController.js
├── routes/documentRoutes.js
├── services/documentService.js
└── middleware/uploadMiddleware.js
```

### B. Services
- **`uploadToStorage(file)`**: Pushes files to designated Supabase storage bucket directories.
- **`registerDocument(docData)`**: Stores file references in the database.

### C. Controllers
- `uploadDocument`: Handles multipart file uploads.

### D. Routes
- `POST /api/v1/documents/upload`

### E. Middleware
- **`upload`**: Multer configuration checking file size and PDF extensions.

### F. Validation
- File size constraint (< 10MB).
- Mime-types restricted to PDF and Word.

### G. Testing
- Verify upload error on `.exe` or executable scripts.

---

## Milestone 6: Event Management

### A. Folder Structure
```text
server/
├── controllers/eventController.js
├── routes/eventRoutes.js
├── services/eventService.js
└── validators/eventValidator.js
```

### B. Services
- **`createEvent(eventData)`**: Inserts events schedules.
- **`registerRSVP(eventId, userId)`**: Logs resident RSVPs.

### C. Controllers
- `createEvent`: Schedules new events.
- `submitRSVP`: Enters RSVPs.

### D. Routes
- `GET /api/v1/events`
- `POST /api/v1/events`
- `POST /api/v1/events/:id/register`

### E. Middleware
- verfyToken.

### F. Validation
- Event date must be in the future.

### G. Testing
- Verify duplicate RSVPs are rejected with `409 Conflict`.

---

## Milestone 7: Complaint Management

### A. Folder Structure
```text
server/
├── controllers/complaintController.js
├── routes/complaintRoutes.js
├── services/complaintService.js
└── validators/complaintValidator.js
```

### B. Services
- **`fileComplaint(complaintData)`**: Inserts complaints tickets.
- **`assignContractor(complaintId, contractorId)`**: Updates assigned staff details.

### C. Controllers
- `logComplaint`: Logs complaints.
- `updateStatus`: Resolves tickets.

### D. Routes
- `POST /api/v1/complaints`
- `PATCH /api/v1/complaints/:id/status`

### E. Middleware
- Residents restricted to own tickets; Admins read all.

### F. Validation
- Priority enum check (`Low`, `Medium`, `High`, `Critical`).

### G. Testing
- Verify status changes are recorded in audit logs.

---

## Milestone 8: Payment Management

### A. Folder Structure
```text
server/
├── controllers/paymentController.js
├── routes/paymentRoutes.js
├── services/paymentService.js
└── validators/paymentValidator.js
```

### B. Services
- **`initiateRazorpayOrder(amount, purpose)`**: Generates Razorpay order parameters.
- **`verifySignature(signatureDetails)`**: Verifies webhook details and creates receipts.

### C. Controllers
- `createOrder`: Requests order ID.
- `verifyTransaction`: Finalizes payments.

### D. Routes
- `POST /api/v1/payments/create-order`
- `POST /api/v1/payments/verify`

### E. Middleware
- verifyToken.

### F. Validation
- Amount must be positive.

### G. Testing
- Test mock webhook signature validation checks.

---

## Milestone 9: Gallery Management

### A. Folder Structure
```text
server/
├── controllers/galleryController.js
├── routes/galleryRoutes.js
├── services/galleryService.js
└── validators/galleryValidator.js
```

### B. Services
- **`uploadGalleryImage(file, albumId)`**: Stores photos.

### C. Controllers
- `uploadPhoto`: Pushes photo links to gallery.

### D. Routes
- `GET /api/v1/gallery`
- `POST /api/v1/gallery/upload`

### E. Middleware
- Multer image type filter.

### F. Validation
- Image dimension size restrictions.

### G. Testing
- Verify orphan photos are removed on album deletions.

---

## Milestone 10: Audit Logs

### A. Folder Structure
```text
server/
├── controllers/auditController.js
├── routes/auditRoutes.js
└── services/auditService.js
```

### B. Services
- **`writeAuditLog(userId, action, entity)`**: Records system mutations.

### C. Controllers
- `getAuditLogs`: Fetches system logs directory.

### D. Routes
- `GET /api/v1/admin/audit-logs`

### E. Middleware
- Restricted to SuperAdmin.

### F. Validation
- Query pagination constraints.

### G. Testing
- Verify logged audit trails exist on profile updates.

---

## Milestone 11: AI Assistant Integration

### A. Folder Structure
```text
server/
├── controllers/chatbotController.js
├── routes/chatbotRoutes.js
├── services/chatbotService.js
└── validators/chatbotValidator.js
```

### B. Services
- **`getAIResponse(query)`**: Submits queries to the model.
- **`embedDocument(documentId)`**: Indexes document files.

### C. Controllers
- `submitQuery`: Feeds assistant prompts.

### D. Routes
- `POST /api/v1/chatbot/query`
- `POST /api/v1/chatbot/train`

### E. Middleware
- verifyToken.

### F. Validation
- Search query length validations.

### G. Testing
- Mock vector database coordinate checks.
