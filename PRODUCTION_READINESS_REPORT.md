# ChalChitra MERN — Production Readiness & Security Audit Report

**Project**: ChalChitra Movie Management & Streaming System

**Version**: 2.0.0 Production Ready

**Date**: November 6, 2026

**Status**: All Tests Passed (11/11) · Ready for Deployment

**Auditor**: Senior Full-Stack MERN & DevOps Engineer

---

## 1. Executive Summary & Audit Scorecard

A complete architectural, security, and operational audit was performed on the ChalChitra MERN application. All identified vulnerabilities, process leaks, and deployment blockers were addressed and verified against live MongoDB Atlas infrastructure.

| Evaluation Area | Initial Audit State | Post-Remediation State | Status |
| :--- | :--- | :--- | :--- |
| **Movie Collection State** | Database was empty (0 records); `/api/movies` returned `[]` | Created safe idempotent importer (`server/seeder/safeImport.js`); restored all 15 original movies and user data into Atlas without deleting or overwriting | ✅ 15/15 Restored |
| **Node DNS / Atlas SRV** | Hardcoded Google DNS resolver in `server.js` | Intelligent cross-platform DNS handler (`server/config/dns.js`) with Windows SRV fallback and clean Linux defaults | ✅ Resolved |
| **Process / Port Management** | Orphan Node processes causing `EADDRINUSE: :::5000` on Windows | `concurrently -k` process tree killing, port collision interception, and graceful SIGINT/SIGTERM handlers | ✅ Resolved |
| **Backend Startup Lifecycle** | Server started listening before DB connected; returned healthy even when DB down | Fail-fast startup; server listens only after DB connects; `/api/health` returns HTTP 503 if DB disconnected | ✅ Resolved |
| **Security Headers & CORS** | No Helmet; wildcard unauthenticated CORS | `helmet` CSP/CORP enabled; restricted origin CORS matching `CLIENT_URL` | ✅ Hardened |
| **API Rate Limiting** | No rate limiting; vulnerable to brute force | `express-rate-limit` installed (300 req/15m general, 40 req/15m auth endpoints) | ✅ Hardened |
| **Token Collision & Auth** | Admin token mistakenly sent to `/users/*`, triggering 400 Bad Request; TDZ risk in `AuthContext` | Strict token routing in `client/src/services/api.js`; safe `useCallback` ordering in `AuthContext.jsx`; 403 authorization guard in `userController.js` | ✅ Resolved |
| **SPA Refresh on Vercel** | Missing `vercel.json`; direct page refresh on `/movies`, `/movie/:id` caused 404 | Created `client/vercel.json` and root `vercel.json` with SPA catch-all rewrite (`/(.*)` → `/index.html`) | ✅ Resolved |
| **Secret Management** | Hardcoded secrets in `.env.example` | Clean `.env.example` templates created without sensitive credentials; updated `.gitignore` to prevent leaks | ✅ Secured |

---

## 2. In-Depth Root Cause Analysis & Solutions

### A. Node.js DNS SRV Resolution & Atlas (`server/config/dns.js`)
- **Problem**: On Windows with Node v22+ / v24+, Node's internal c-ares DNS resolver returns `ECONNREFUSED` on `_mongodb._tcp` SRV lookups due to virtual adapters (WSL, Hyper-V) or IPv6 interface priority, even when Windows native `nslookup` succeeds.
- **Flawed Workaround**: `server/server.js` previously hardcoded `dns.setServers(['8.8.8.8', '8.8.4.4'])` at the file header. In cloud environments like Render or AWS, overriding system DNS can break internal service discovery or private VPC DNS.
- **Production Solution**: Created `server/config/dns.js`:
  1. Respects `process.env.DNS_SERVERS` if provided by the administrator.
  2. If running on Windows (`process.platform === 'win32'`) and connecting to an Atlas SRV URI (`mongodb+srv://`), automatically applies fallback public resolvers (`8.8.8.8`, `1.1.1.1`).
  3. In Linux / production environments (Render), it preserves standard OS DNS resolution.

### B. Port 5000 Conflict (`EADDRINUSE`) & Process Management
- **Problem**: When stopping `npm run dev` with Ctrl+C on Windows, child Node processes spawned via `concurrently` and `npm.cmd` were not receiving SIGINT cleanly, remaining active in the background and holding TCP port 5000.
- **Solution**:
  1. Updated root `package.json` to run `concurrently -k` (`--kill-others`). When one process terminates or Ctrl+C is pressed, all child processes in the tree are killed.
  2. Added an `'error'` event listener to `server.listen(PORT)`: intercepts `EADDRINUSE` and prints a clear, friendly diagnostic message instead of an unhandled stack trace.
  3. Added `SIGINT` and `SIGTERM` graceful shutdown listeners that close the HTTP server and Mongoose connection before exiting.

### C. Authentication & Token Routing Audit
- **Problem**:
  - In `client/src/services/api.js`, request interceptor logic for `/users/` evaluated `selectedToken = userToken || adminToken;`. When an admin viewed the user interface, their admin token was sent to `/users/watchlist` and `/users/favorites`, causing 400 Bad Request errors.
- **Solution**:
  - Restructured `client/src/services/api.js`:
    - Admin movie mutations (`POST`, `PUT`, `DELETE /movies`) strictly require `adminToken || userToken`.
    - User personal operations (`/users/*`) strictly attach `userToken`.
    - User profile checks (`/auth/me`) strictly attach `userToken`.
  - In `server/controllers/userController.js`, added explicit role checking: returns 403 Forbidden if an admin account attempts to manipulate personal user watchlists.

### D. Health Check Endpoint (`/api/health`)
- **Problem**: The old health check returned HTTP 200 with `{ status: 'healthy' }` regardless of whether MongoDB was connected.
- **Solution**: Updated `/api/health` in `server/server.js`:
  - Checks `mongoose.connection.readyState === 1`.
  - Returns **HTTP 200** with `{ status: 'healthy', database: { status: 'connected', host, name } }` when connected.
  - Returns **HTTP 503 Service Unavailable** with `{ status: 'unhealthy', database: { status: 'disconnected' } }` if MongoDB is down.

---

## 3. Files Modified and Added

| File Path | Action | Description |
| :--- | :--- | :--- |
| `server/server.js` | Modified | Added Helmet, restricted CORS, rate limiting, fail-fast DB connection, 0.0.0.0 binding, EADDRINUSE handling, graceful shutdown |
| `server/config/dns.js` | Created | Cross-platform DNS resolver supporting Windows Atlas fallback and Linux system DNS |
| `server/config/db.js` | Modified | Fail-fast connection with 10s timeout, credential masking, and connection event listeners |
| `server/controllers/userController.js` | Modified | Role isolation (403 for admin on user watchlists), safe ObjectId/legacyId resolver, null checks |
| `client/src/services/api.js` | Modified | Base URL normalization, strict user vs admin token routing in request interceptor |
| `client/src/context/AuthContext.jsx` | Modified | Safe `useCallback` logout ordering, movie ID/object toggle normalization |
| `package.json` | Modified | Added `-k` (`--kill-others`) to `concurrently` dev script for clean process termination |
| `server/package.json` | Modified | Added `helmet` and `express-rate-limit` production dependencies |
| `server/.env.example` | Modified | Documented required backend environment variables without real credentials |
| `client/.env.example` | Modified | Documented client environment variables (`VITE_API_URL`) |
| `.gitignore` | Modified | Added strict patterns for `.env*`, `.pptx`, test artifacts, and build outputs |
| `client/vercel.json` | Created | SPA rewrite rule (`/(.*)` → `/index.html`) and static asset caching |
| `vercel.json` | Created | Root Vercel deployment configuration pointing to client directory |
| `render.yaml` | Created | Render Infrastructure-as-Code Blueprint specification |
| `DEPLOYMENT.md` | Created | Complete step-by-step production deployment manual |

---

## 4. Test Verification Evidence

The test suite was executed against the live **MongoDB Atlas cluster** (`ac-o77e9vo-shard-00-01.x5bd0qw.mongodb.net/chalchitra`):

```
=== CHALCHITRA PRODUCTION VERIFICATION SUITE ===

--- TEST GROUP 1: DNS & ATLAS CONNECTIVITY ---
[DNS] Windows Atlas SRV fallback applied: 8.8.8.8, 1.1.1.1
✅ [PASS] configureDNS executed without exception

Connecting to MongoDB Atlas...
[MongoDB] Connected successfully: ac-o77e9vo-shard-00-01.x5bd0qw.mongodb.net/chalchitra
✅ [PASS] MongoDB Atlas connection established

--- TEST GROUP 2: HEALTH & SYSTEM DIAGNOSTICS ---
✅ [PASS] Health check reflects healthy database status

--- TEST GROUP 3: MOVIE SCHEMA CRUD CYCLE ON ATLAS ---
✅ [PASS] Movie CREATE operation succeeded on Atlas cluster
✅ [PASS] Movie READ by ID succeeded
✅ [PASS] Movie UPDATE rating operation succeeded
✅ [PASS] Movie DELETE operation succeeded (Atlas left pristine)

--- TEST GROUP 4: AUTHENTICATION & ACCESS CONTROL ---
✅ [PASS] ADMIN_PASSWORD is configured
✅ [PASS] User JWT signed and verified correctly
✅ [PASS] Admin JWT signed and verified with admin clearance

--- TEST GROUP 5: WATCHLIST & FAVORITES ARCHITECTURE ---
✅ [PASS] Admin tokens do not hold personal user IDs (prevents state contamination)

================================================
TOTAL TESTS: 11 | PASSED: 11 | FAILED: 0
================================================
```

### Frontend Build & Lint Verification
- **Frontend Lint (`oxlint`)**: Passed with 0 errors across 28 files.
- **Frontend Production Build (`vite build`)**: Passed cleanly in **274ms** (`dist/assets/index-CbQcLdBz.js`, gzip: 126.00 kB).

---

## 5. Environment Variables Checklist

### Backend (`server/.env` or Render Dashboard)
```env
PORT=10000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@chalchitra.x5bd0qw.mongodb.net/chalchitra?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<secure_random_64_char_string>
ADMIN_PASSWORD=<your_chosen_admin_password>
CLIENT_URL=https://<your-frontend>.vercel.app
```

### Frontend (`client/.env` or Vercel Dashboard)
```env
VITE_API_URL=https://<your-backend>.onrender.com/api
```

---

## 6. Final Production Sign-off

- [x] All 11 verification tests passed on live Atlas cluster.
- [x] Frontend builds with zero compile errors.
- [x] Security headers (Helmet) and rate limiting enabled.
- [x] CORS configured for production Vercel domain.
- [x] SPA direct navigation rewrites added for Vercel.
- [x] Process management fixed for Windows dev (`npm run dev`).
- [x] Zero database records deleted or overwritten.
- [x] Detailed `DEPLOYMENT.md` guide created.
