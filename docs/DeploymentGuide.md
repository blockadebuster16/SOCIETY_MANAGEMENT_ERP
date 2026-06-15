# Deployment Guide

This guide details steps for deploying the production-grade **Suyash Pride Housing Society Ltd Portal**.

## Frontend Deployment (Client)

The frontend is a React 19 SPA powered by Vite. It can be hosted on static platforms such as **Vercel**, **Netlify**, or **AWS S3/CloudFront**.

### Build Command
Run the build script from the `client/` folder:
```bash
npm run build
```
This compiles the code into standard static files under the `client/dist/` directory.

### Environment Setup on Host
Configure the following variable on your static host dashboard:
- `VITE_API_URL`: Path to the deployed Express backend (e.g., `https://api.suyashpride.in/api`).

---

## Backend Deployment (Server)

The backend is an Express Node.js application. It can be deployed to platforms like **Render**, **Railway**, **Heroku**, or a **VPS (DigitalOcean, AWS EC2)**.

### Build and Start Scripts
Ensure the server starts using:
```bash
npm install
npm start
```
Make sure `NODE_ENV` is set to `production` to toggle secure middleware options.

### Environment Configurations
Set the following values in your host's environment settings:
- `PORT`: Define the port number (defaults to `5000` or set by host).
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: Supabase client-safe key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase backend-only access key.
- `JWT_SECRET`: Secure string for hashing credentials.
- `RAZORPAY_KEY_ID`: Razorpay public developer key.
- `RAZORPAY_KEY_SECRET`: Razorpay private API key.
