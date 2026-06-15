# Production Quality & Testing Checklist

This checklist outlines the manual verification testing steps required to validate all modules of the housing portal before pushing to staging.

## 1. Authentication & Session Verification
- [ ] **Prefill verification**: Click the quick-prefill buttons on `/login` and confirm they successfully input user emails.
- [ ] **Resident Sign-in**: Authenticate as Parth (`parth@example.com` / `password123`) and verify redirect to `/resident/dashboard`.
- [ ] **Admin Sign-in**: Authenticate as Committee Secretary (`secretary@suyashpride.org` / `password123`) and verify redirect to `/admin/dashboard`.
- [ ] **Guard Sign-in**: Authenticate as Security Guard (`security@suyashpride.in` / `password123`) and verify redirect to `/security/dashboard`.
- [ ] **Protected Routes**: Verify that typing `/admin/dashboard` while logged in as a resident block access and triggers a security fallback warning.

## 2. Resident Billing & Simulated Payments
- [ ] **Dues Outstanding Card**: Verify that Flat A-102 outstanding balance aggregates base maintenance + dynamic late penalties (18% p.a. calculated after grace period).
- [ ] **Razorpay Checkout**: Click "Pay Now", select UPI method, and click "Simulate Payment". Confirm that processing/verifying animations complete and show the transaction success ID.
- [ ] **chronological Ledger**: Navigate to Payment History and confirm that the paid invoice is logged with Debit/Credit columns and running balances.
- [ ] **Receipt download**: Click "View Receipt" and test "Download Text Receipt" to verify the client-side `.txt` download.

## 3. Security Guard Operations
- [ ] **Gate Pass Validation**: Enter `GP-A102X` in the passcode box and confirm check-in logs show guest Ramesh Shah.
- [ ] **Ad-hoc Guest Logs**: Fill out the ad-hoc form for a new delivery agent. Verify that the entry is posted immediately to the "Active Visitors" log.
- [ ] **Checkout Validation**: Select a guest inside the active visitor register, click "Check-Out", and confirm they disappear from the active registry and display in the history logs.
- [ ] **Incident alert**: Log a high severity occurrence and check that it prints to the incident logs table.

## 4. Reports & Analytics Audit
- [ ] **Recharts rendering**: Go to `/admin/analytics` and confirm that all 4 charts load.
- [ ] **Date Filters**: Modify start/end dates and confirm stats cards adjust.
- [ ] **CSV Exporters**: Click the download icons on each chart block and verify they successfully download CSV format spreadsheets.
