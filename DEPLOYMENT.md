# ChalChitra — Complete Production Deployment Guide

This comprehensive guide details how to deploy the **ChalChitra Movie Management & Streaming System** across **MongoDB Atlas (Database)**, **Render (Backend API)**, and **Vercel (Frontend Client)**.

---

## Architecture Overview

```
┌─────────────────────────────────┐
│        Vercel (Frontend)        │
│   React 19 + Vite (Client)      │
│   Domain: https://<app>.vercel.app│
└────────────────┬────────────────┘
                 │ HTTPS API Calls (VITE_API_URL)
                 ▼
┌─────────────────────────────────┐
│         Render (Backend)        │
│       Express.js + Node.js      │
│   Domain: https://<api>.onrender.com
└────────────────┬────────────────┘
                 │ Mongoose (TLS / SRV)
                 ▼
┌─────────────────────────────────┐
│     MongoDB Atlas (Database)    │
│  M0 Free Tier Cluster (replica) │
│ Host: chalchitra.x5bd0qw.mongodb.net
└─────────────────────────────────┘
```

---

## 1. Step-by-Step MongoDB Atlas Setup

### Step 1.1: Verify Cluster & Database
1. Log into your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Under **Database Deployments**, ensure your cluster is active (e.g. `Cluster0` or `chalchitra`).
3. Database name: `chalchitra`.

### Step 1.2: Configure Database User Authentication
1. Navigate to **Security** → **Database Access**.
2. Click **Add New Database User**:
   - **Authentication Method**: Password (SCRAM-SHA-256).
   - **Username**: Create a dedicated service username (e.g., `chalchitra_prod_user`).
   - **Password**: Generate a secure 32-character password. *(Avoid using special characters like `@`, `:`, or `/` in the password, or URL-encode them if present)*.
   - **Database User Privileges**: Select **Read and write to any database** (or restrict to `chalchitra`).
   - Click **Add User**.

### Step 1.3: Configure Network Access (IP Access List)
> [!IMPORTANT]
> Render's free tier web services do not have static outbound IP addresses. Their outbound traffic routes through AWS/GCP dynamic IP pools.

1. Navigate to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. For Render deployment compatibility:
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - Description: `Render Web Service dynamic outbound IP access`.
   - Click **Confirm**.
4. *(Note: Because `0.0.0.0/0` is enabled, your database is protected by your strong database user password and TLS encryption. Never share or commit your database password).*

### Step 1.4: Obtain Connection String
1. Go to **Database** → Click **Connect** on your cluster.
2. Select **Drivers** (Node.js, Version 5.5 or later).
3. Copy the SRV connection URI:
   ```
   mongodb+srv://<username>:<password>@chalchitra.x5bd0qw.mongodb.net/chalchitra?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Replace `<username>` and `<password>` with the credentials created in Step 1.2.

---

## 2. Step-by-Step Render Backend Deployment

You can deploy the backend using either **Render Blueprints** (automatic via `render.yaml`) or **Manual Web Service Setup**.

### Method A: Manual Web Service Setup (Recommended)
1. Sign in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → Select **Web Service**.
3. Connect your GitHub repository:
   `https://github.com/vu241fa04536-cmd/ChalChitra-Movie-Management-System-Complete-Project`
4. Configure the service settings:
   - **Name**: `chalchitra-api`
   - **Region**: Choose the region closest to your MongoDB Atlas cluster (e.g., *Singapore* or *Oregon*).
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Configure **Environment Variables** (under *Advanced*):
   | Key | Recommended Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production security & optimizations |
   | `PORT` | `10000` | Port assigned by Render (automatically handled) |
   | `MONGO_URI` | `mongodb+srv://...` | Your Atlas connection string from Step 1.4 |
   | `JWT_SECRET` | *(Random 64-char string)* | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `ADMIN_PASSWORD` | *(Your secure admin key)* | Password to authenticate into `/admin` control center |
   | `CLIENT_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (add after Step 3) |
6. Health Check Path:
   - **Health Check Path**: `/api/health`
7. Click **Create Web Service**.
8. Once deployed, copy your backend URL (e.g. `https://chalchitra-api.onrender.com`).
9. Verify by navigating to: `https://chalchitra-api.onrender.com/api/health` in your browser. It should respond with HTTP 200 and `"status": "healthy"`.

---

## 3. Step-by-Step Vercel Frontend Deployment

### Step 3.1: Import Project in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository:
   `https://github.com/vu241fa04536-cmd/ChalChitra-Movie-Management-System-Complete-Project`

### Step 3.2: Configure Build & Output Settings
1. **Framework Preset**: `Vite`
2. **Root Directory**: Click **Edit** and select `client`.
3. Build & Output settings:
   - **Build Command**: `npm run build` (or leave default Vite command)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3.3: Configure Environment Variables
Under the **Environment Variables** accordion, add:
| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://chalchitra-api.onrender.com/api` | Your Render backend URL with the `/api` suffix |

4. Click **Deploy**.

### Step 3.4: SPA Routing Verification
- `client/vercel.json` contains the SPA rewrite rule (`/(.*)` → `/index.html`).
- Once deployed, test refreshing directly on `/movies`, `/webseries`, `/trailers`, or `/movie/:id` to confirm that direct page refreshes work without 404 errors.

---

## 4. Final Hookup (Connecting CORS)

1. Return to your **Render Dashboard** → `chalchitra-api` → **Environment**.
2. Update `CLIENT_URL` to include your live Vercel domain:
   ```
   CLIENT_URL=https://<your-actual-subdomain>.vercel.app
   ```
3. Click **Save Changes**. Render will automatically redeploy the backend with the new allowed origin.

---

## 5. Local Development Quickstart

To run the complete full-stack project locally:

```bash
# 1. Install all dependencies across root, server, and client
npm run install:all

# 2. Configure local environment variables
# Ensure server/.env has valid MONGO_URI and JWT_SECRET

# 3. Start both backend and frontend concurrently
npm run dev
```

- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- Frontend UI: `http://localhost:5173`
- Clean exit: Press `Ctrl + C` in your terminal to terminate both processes cleanly without port locking.
