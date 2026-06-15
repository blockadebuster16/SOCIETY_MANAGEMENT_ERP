# Detailed Frontend Development Roadmap

This document outlines the step-by-step implementation roadmap for the **Suyash Pride Portal** frontend, structured into 12 development milestones.

---

## Milestone 1: Authentication

### A. Folder Structure & Files
```text
client/src/
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useAuth.js
├── routes/
│   ├── ProtectedRoute.jsx
│   └── AppRoutes.jsx
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    └── ForgotPassword.jsx
```

### B. Views & Routes
- `/login` - Credential sign-in form.
- `/register` - Account registration form.
- `/forgot-password` - Password recovery form.

### C. Components
- `AuthCard`: Visual card framing form fields.
- `InputField`: Reusable input field displaying validation error states.
- `SubmitButton`: Button demonstrating loading states during auth requests.

### D. State Management & Hooks
- **`AuthContext`**: Context provider storing authenticated user state, JWT tokens, and user metadata.
- **`useAuth()`**: Hook to access login, register, profile refresh, and logout actions.
- **`isSubmitting`**: Local form state for submit transitions.

### E. API Integration & Service Layer
- **`services/authService.js`**:
  - `loginUser(email, password)` maps to `POST /api/v1/auth/login`. Returns user profile and JWT.
  - `registerUser(details)` maps to `POST /api/v1/auth/register`. Creates profile and returns JWT.
  - `fetchProfile()` maps to `GET /api/v1/auth/profile` with `Authorization: Bearer <token>`.

### F. Verification Plan
- Verify that entering incorrect credentials triggers visual toast warnings.
- Confirm successful authentication redirects the user to the correct layout based on user role (Resident vs. Admin).

---

## Milestone 2: Public Website

### A. Folder Structure & Files
```text
client/src/
├── layouts/
│   └── PublicLayout.jsx
└── pages/
    ├── Home.jsx
    ├── About.jsx
    ├── Contact.jsx
    └── FloorPlans.jsx
```

### B. Views & Routes
- `/` - Landing Page containing hero images and overview sections.
- `/about` - Core committee structures and society info.
- `/contact` - Official inquiry forms and Google/OSM map pins.
- `/floor-plans` - Grid layouts of towers.

### C. Components
- `PublicHeader`: Navigation bar with transition controls.
- `PublicFooter`: Footer with links and registration details.
- `AmenityCard`: Cards showing housing features (clubhouse, playground, parking).
- `ContactForm`: Contact form component.

### D. State Management & Hooks
- **`contactPayload`**: Form submission state hooks.
- **`isMenuOpen`**: Toggle trigger for mobile menu displays.

### E. API Integration & Service Layer
- **`services/publicService.js`**:
  - `submitInquiry(formData)` maps to `POST /api/v1/public/inquiries`.
  - Fetch public notices list from `GET /api/v1/notices` (public endpoint).

### F. Verification Plan
- Test responsive layouts on mobile, tablet, and desktop display monitors.
- Confirm form submissions execute with a visual success confirmation modal.

---

## Milestone 3: Resident Dashboard

### A. Folder Structure & Files
```text
client/src/
├── layouts/
│   └── ResidentLayout.jsx
└── pages/
    └── resident/
        ├── Dashboard.jsx
        ├── Profile.jsx
        └── Settings.jsx
```

### B. Views & Routes
- `/resident/dashboard` - Central dashboard hub.
- `/resident/profile` - User profile, contact, and vehicle details.
- `/resident/settings` - UI language, dark mode toggle, and notification switches.

### C. Components
- `StatCard`: Visual cards displaying bills outstanding, open complaints, or active notices.
- `ActionGrid`: Grid of icon buttons linking to invoices, RSVPs, or complaint filing.
- `MiniNotices`: List of the top 3 pinned notices.
- `VehicleList`: Grid component displaying registered resident vehicles.

### D. State Management & Hooks
- **`residentStats`**: Local state tracking dashboard overview parameters.
- **`profileData`**: Form states tracking updates to phone numbers or profile pictures.

### E. API Integration & Service Layer
- **`services/residentService.js`**:
  - `getDashboardSummary()` calls `GET /api/v1/auth/profile` and fetches mini state counts.
  - `updateProfile(details)` maps to `PATCH /api/v1/auth/profile`.

### F. Verification Plan
- Verify that numeric dashboard summaries correspond exactly to values returned from backend APIs.
- Confirm profile image updates immediately render in layout sidebars.

---

## Milestone 4: Admin Dashboard

### A. Folder Structure & Files
```text
client/src/
├── layouts/
│   └── AdminLayout.jsx
└── pages/
    └── admin/
        ├── Dashboard.jsx
        └── Residents.jsx
```

### B. Views & Routes
- `/admin/dashboard` - Analytics, statistics, and quick manager actions.
- `/admin/residents` - Filterable grid of all society residents.

### C. Components
- `CollectionChart`: Responsive SVG bar chart tracking maintenance collections.
- `ComplaintProgressCircle`: SVG progress ring checking resolved complaints.
- `ResidentTable`: Grid table supporting pagination, search, and validation buttons.
- `VerifyModal`: Access confirmation modal for onboarding pending profiles.

### D. State Management & Hooks
- **`collectionTimeline`**: State containing financial chart values.
- **`filters`**: Text and status checks for filtering residents list.

### E. API Integration & Service Layer
- **`services/adminService.js`**:
  - `getAnalyticsSummary()` maps to `GET /api/v1/admin/analytics`.
  - `listResidents(filters)` maps to `GET /api/v1/residents`.
  - `verifyResident(userId, status)` maps to `PATCH /api/v1/residents/:id/verify`.

### F. Verification Plan
- Confirm that the resident filter system dynamically filters results by Wing (A-D) or role.
- Verify that SVG charts scale correctly without layout breakage on smaller screens.

---

## Milestone 5: Notices

### A. Folder Structure & Files
```text
client/src/
├── components/notices/
│   ├── NoticeCard.jsx
│   └── NoticeForm.jsx
└── pages/
    ├── Notices.jsx
    ├── NoticeDetails.jsx
    └── admin/
        └── ManageNotices.jsx
```

### B. Views & Routes
- `/notices` - Public board listing notices.
- `/notices/:id` - Detailed notice page with attachments.
- `/admin/notices` - Admin management grid.
- `/admin/notices/new` - Form to compose notices.
- `/admin/notices/:id/edit` - Form to edit notices.

### C. Components
- `NoticeCard`: Card displaying title, date, snippet, and category indicator badges.
- `NoticeForm`: Text editor and file input fields for attachments.
- `CategoryFilter`: Row of tags/pills to filter notices (e.g. AGM, Security).

### D. State Management & Hooks
- **`noticesList`**: Array of notices with pagination parameters.
- **`activeCategory`**: State tracking selected category.

### E. API Integration & Service Layer
- **`services/noticeService.js`**:
  - `getNotices(params)` maps to `GET /api/v1/notices`.
  - `getNoticeById(id)` maps to `GET /api/v1/notices/:id`.
  - `createNotice(formData)` maps to `POST /api/v1/notices` (handles file upload).
  - `updateNotice(id, formData)` maps to `PUT /api/v1/notices/:id`.
  - `deleteNotice(id)` maps to `DELETE /api/v1/notices/:id`.

### F. Verification Plan
- Verify that clicking category tags correctly filters the list payload.
- Confirm admin uploaded attachments are downloadable from the notice details page.

---

## Milestone 6: Documents

### A. Folder Structure & Files
```text
client/src/
├── components/documents/
│   └── DocumentRow.jsx
└── pages/
    ├── resident/
        └── Documents.jsx
    └── admin/
        └── ManageDocuments.jsx
```

### B. Views & Routes
- `/resident/documents` - Private resident folder (share certificate, sales deed).
- `/resident/downloads` - Public blank forms, NOC formats.
- `/admin/documents` - System-wide file directory manager.

### C. Components
- `DocumentRow`: List row layout displaying file type icons, name, file size, upload dates, and action menus.
- `UploadModal`: Admin upload file modal.

### D. State Management & Hooks
- **`documentsList`**: File array states.
- **`uploadProgress`**: Numbers indicating file upload progress.

### E. API Integration & Service Layer
- **`services/documentService.js`**:
  - `fetchDocuments(type)` maps to `GET /api/v1/documents`.
  - `uploadDocument(formData)` maps to `POST /api/v1/documents/upload`.
  - `deleteDocument(id)` maps to `DELETE /api/v1/documents/:id`.

### F. Verification Plan
- Test file upload validation checks (blocking files larger than 10MB or disallowed extensions).
- Verify private documents are inaccessible without bearer credentials.

---

## Milestone 7: Events

### A. Folder Structure & Files
```text
client/src/
├── components/events/
│   └── EventCard.jsx
└── pages/
    ├── Events.jsx
    ├── EventDetails.jsx
    └── admin/
        └── ManageEvents.jsx
```

### B. Views & Routes
- `/events` - Public community calendar.
- `/events/:id` - Detailed description and registration card.
- `/admin/events` - Admin scheduling console.

### C. Components
- `EventCard`: Card showing event schedules, image, locations, and RSVP counts.
- `RSVPSection`: Interactive button triggers logging RSVP selections.
- `EventForm`: Admin event schedule planner.

### D. State Management & Hooks
- **`rsvpStatus`**: State tracker for RSVP button states.
- **`eventTimeline`**: Calendars dates data mappings.

### E. API Integration & Service Layer
- **`services/eventService.js`**:
  - `getEvents()` maps to `GET /api/v1/events`.
  - `getEventDetails(id)` maps to `GET /api/v1/events/:id`.
  - `postRSVP(id)` maps to `POST /api/v1/events/:id/register`.
  - `createEvent(details)` maps to `POST /api/v1/events`.

### F. Verification Plan
- Verify RSVP toggling (attending vs. not attending) updates UI counts dynamically.
- Confirm events scheduled in the past are marked as completed.

---

## Milestone 8: Complaints

### A. Folder Structure & Files
```text
client/src/
├── components/complaints/
│   └── ComplaintRow.jsx
└── pages/
    ├── resident/
    │   ├── Complaints.jsx
    │   └── ComplaintDetails.jsx
    └── admin/
        └── ManageComplaints.jsx
```

### B. Views & Routes
- `/resident/complaints` - Resident ticket list.
- `/resident/complaints/:id` - Chat logs and action timeline.
- `/admin/complaints` - Global complaints queue manager.

### C. Components
- `ComplaintRow`: Row showing priority levels, ticket status, and description snippets.
- `FileComplaintModal`: Form modal for filing a complaint.
- `CommentBox`: Comment list and input box for updates.
- `StatusStepper`: Graphical steps showing complaint lifecycle progress.

### D. State Management & Hooks
- **`ticketsQueue`**: State holding ticket lists.
- **`activeTicket`**: Selected ticket object with comments logs.

### E. API Integration & Service Layer
- **`services/complaintService.js`**:
  - `fetchTickets()` maps to `GET /api/v1/complaints`.
  - `submitTicket(details)` maps to `POST /api/v1/complaints`.
  - `addComment(ticketId, comment)` maps to `POST /api/v1/complaints/:id/comments`.
  - `updateTicketStatus(ticketId, status)` maps to `PATCH /api/v1/complaints/:id/status`.

### F. Verification Plan
- Verify new complaints display under the "Open" state in real-time.
- Test that comments update correctly without page refreshes.

---

## Milestone 9: Payments

### A. Folder Structure & Files
```text
client/src/
├── components/payments/
│   └── PaymentRow.jsx
└── pages/
    ├── resident/
    │   ├── Payments.jsx
    │   └── PaymentHistory.jsx
    └── admin/
        └── ManagePayments.jsx
```

### B. Views & Routes
- `/resident/payments` - Pending bills and maintenance tracker.
- `/resident/payment-history` - Transaction ledgers and receipts download.
- `/admin/payments` - Billing controls panel.

### C. Components
- `InvoiceRow`: Card containing invoice metadata and action buttons.
- `PaymentButton`: Triggers Razorpay JS SDK window frames.
- `ReceiptModal`: Visual popups containing transaction receipts.

### D. State Management & Hooks
- **`billsState`**: Array of pending/paid invoices.
- **`paymentLoader`**: Boolean tracking payment gateways.

### E. API Integration & Service Layer
- **`services/paymentService.js`**:
  - `getPendingBills()` maps to `GET /api/v1/payments`.
  - `initiateOrder(billId)` maps to `POST /api/v1/payments/create-order`.
  - `verifyPayment(details)` maps to `POST /api/v1/payments/verify`.

### F. Verification Plan
- Click "Pay" to confirm the Razorpay checkout overlay pops up correctly.
- Verify payment statuses update in the UI immediately upon checkout completion.

---

## Milestone 10: Chatbot

### A. Folder Structure & Files
```text
client/src/
├── components/chatbot/
│   └── ChatWidget.jsx
└── pages/
    ├── ChatAssistant.jsx
    └── admin/
        └── ChatbotTraining.jsx
```

### B. Views & Routes
- `/chat-assistant` - Public chat console.
- `/resident/chatbot` - Protected portal bot interface.
- `/admin/chatbot-training` - Interface to upload FAQs.

### C. Components
- `ChatWidget`: Floating widget popup overlay.
- `ChatWindow`: Dialogue feed.
- `MessageBubble`: Text frames for user prompts and assistant replies.
- `SuggestedPill`: Dynamic prompt suggestion pills.

### D. State Management & Hooks
- **`conversationHistory`**: Array of message dialogue objects.
- **`isTyping`**: State checking mock/AI processing.

### E. API Integration & Service Layer
- **`services/chatbotService.js`**:
  - `askAssistant(query)` maps to `POST /api/v1/chatbot/query`.
  - `uploadTrainingDoc(formData)` maps to `POST /api/v1/chatbot/train`.

### F. Verification Plan
- Verify chat feeds auto-scroll to the bottom on new message submission.
- Confirm typing indicators activate correctly during model inference.

---

## Milestone 11: Maps

### A. Folder Structure & Files
```text
client/src/
└── components/map/
    ├── MapWidget.jsx
    └── ParkingMap.jsx
```

### B. Views & Routes
- Maps are embedded within `/contact` and `/floor-plans` view overlays.

### C. Components
- `MapWidget`: OpenStreetMap container centered at Ulwe Raigad coordinates.
- `ParkingGrid`: Grid mapping reserved/available parking slots.

### D. State Management & Hooks
- **`selectedSlot`**: Active slot selections in grid layout maps.

### E. API Integration & Service Layer
- **`services/mapService.js`**:
  - `getParkingLayout()` maps to `GET /api/v1/residents/parking`.

### F. Verification Plan
- Confirm maps drag and scale cleanly under mobile layouts.
- Click slot indicators to check that parking metadata popups display correctly.

---

## Milestone 12: Notifications

### A. Folder Structure & Files
```text
client/src/
├── context/
│   └── NotificationContext.jsx
├── hooks/
│   └── useNotifications.js
└── components/
    ├── NotificationBell.jsx
    └── ToastContainer.jsx
```

### B. Views & Routes
- Bell icon triggers lists overlays on layouts headers.

### C. Components
- `NotificationBell`: Badge icons tracking unread notifications counts.
- `NotificationInbox`: Drawer panel layout listings recent alerts.
- `ToastAlert`: Overlay toaster alert card.

### D. State Management & Hooks
- **`NotificationContext`**: Stores notification collections.
- **`useNotifications()`**: Hooks trigger manual notification pushes.

### E. API Integration & Service Layer
- **`services/notificationService.js`**:
  - `getNotifications()` maps to `GET /api/v1/notifications`.
  - `markAsRead(id)` maps to `PUT /api/v1/notifications/:id/read`.

### F. Verification Plan
- Trigger mock notifications to confirm banner slide-ins appear correctly.
- Verify reading notification items decrements the unread count immediately.
