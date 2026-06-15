# Production Deployment Checklist

Follow this workflow to build and deploy the MERN stack application to staging and production hosting environments.

## 1. Environment Configurations (Env Variables Setup)

Ensure the following variables are configured in the cloud hosting dashboards:
- **Frontend (Vercel)**:
  - `VITE_API_URL`: Root path to the backend server (e.g. `https://api.suyashpride.in`).
- **Backend (Railway/Render)**:
  - `PORT`: Port number (defaults to `5000` or assigned by host).
  - `JWT_SECRET`: Secure cryptographic token signature seed.
  - `SUPABASE_URL`: Live Supabase connection URL.
  - `SUPABASE_ANON_KEY`: Client anon key.
  - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key (keep private).
  - `RAZORPAY_KEY_ID`: Live Razorpay merchant key ID.
  - `RAZORPAY_KEY_SECRET`: Live Razorpay API secret key.

## 2. Database Migrations Execution
- [ ] Connect to the production Supabase PostgreSQL instance.
- [ ] Run the SQL migration scripts in order:
  - `0001_initial_schema.sql` (Creates tables, indexes, and triggers)
  - `0002_seed_data.sql` (Seeds Wings, properties, and default committee profiles)
  - `0003_update_notices_categories.sql`
  - `0004_update_documents_schema.sql`
  - `0005_update_complaints_schema.sql`
  - `0006_update_events_schema.sql`
  - `0007_maintenance_billing_system.sql`
  - `0008_create_notifications_schema.sql`
  - `0009_create_chatbot_faqs.sql`
  - `0010_create_visitor_security_schema.sql`

## 3. Frontend Compilation Build Check
- [ ] Run the production build command inside the `client` directory:
  ```bash
  npm run build
  ```
- [ ] Verify that `client/dist` outputs compile cleanly without linting or peer-dependency errors.

## 4. Backend Express Launch Check
- [ ] Spin up the live Express server:
  ```bash
  npm start
  ```
- [ ] Call the public health check endpoint `/api/health` and verify it returns a `200 OK` status with `service: "UP"`.

## 5. Security & Domain Redirection
- [ ] Map domains `suyashpride.in` (UI) and `api.suyashpride.in` (Server).
- [ ] Force HTTPS redirects in Cloudflare DNS dashboard.
- [ ] Restrict CORS origins on backend to allow requests only from `https://suyashpride.in`.
