# 🎬 ChalChitra — Full-Stack MERN Movie Management & Streaming System

> A modern, full-stack **MERN Application** (MongoDB, Express.js, React.js, Node.js) for browsing Movies, Web Series, Cartoons, and Trailers with user authentication, personal watchlists/favorites, and a secure Admin CRUD dashboard.

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React.js](https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

---

## 🌟 Key Features

* 🗄️ **MongoDB Database with Mongoose:** Scalable document storage for movies, series, cartoons, and user accounts with relational referencing (Watchlist & Favorites).
* ⚙️ **RESTful Express API:** Clean architecture with controllers, middleware, models, and routes.
* ⚛️ **Modern React Frontend (Vite):** Fast, component-driven Single Page Application with React Router v6 and Context API.
* 🔐 **Authentication & Authorization:** 
  * User registration and login with **bcrypt password hashing** and **JWT (JSON Web Tokens)**.
  * Role-based access control protecting Admin CRUD routes.
* 🛠️ **Full CRUD Operations:**
  * **Create:** Admin adds movies/series with posters, YouTube trailers, and streaming links.
  * **Read:** Multi-parameter search, genre, language, type, and sort filters.
  * **Update:** Admin can edit any existing title with pre-filled modal forms.
  * **Delete:** Admin can delete content records with instant database removal.
* 🌍 **Multi-Lingual Localization:** Instant dynamic switching between **English**, **Hindi (हिन्दी)**, and **Telugu (తెలుగు)**.
* 📺 **Inline YouTube Trailers:** Embedded responsive 16:9 video player allowing direct inline playback without redirects.
* ❤️ **User Personalization:** Toggle movies into personal **Watchlist** and **Favorites** with persistent database storage.

---

## 📂 Project Structure

```text
ChalChitra/
├── server/                         # Backend (Node.js, Express, MongoDB)
│   ├── config/
│   │   └── db.js                  # Mongoose connection
│   ├── models/
│   │   ├── Movie.js               # Movie, Series, Cartoon Schema
│   │   └── User.js                # User Schema (with Watchlist & Favorites)
│   ├── controllers/
│   │   ├── movieController.js     # CRUD: get, getById, create, update, delete
│   │   ├── authController.js      # register, login, adminLogin, getMe
│   │   └── userController.js      # getWatchlist, toggleWatchlist, favorites
│   ├── routes/
│   │   ├── movieRoutes.js         # /api/movies
│   │   ├── authRoutes.js          # /api/auth
│   │   └── userRoutes.js          # /api/users
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification & role authorization
│   │   └── errorMiddleware.js     # Global error & 404 handler
│   ├── seeder/
│   │   └── seed.js                # Database seeder importing initial data
│   ├── .env                       # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json
│   └── server.js                  # Entry point
│
├── client/                         # Frontend (React.js, Vite)
│   ├── src/
│   │   ├── assets/                # Backgrounds, posters, and imagery
│   │   ├── components/            # Reusable UI (Navbar, Footer, MovieCard, HeroSlider, FilterBar)
│   │   ├── context/               # AuthContext (JWT/User/Admin) & LanguageContext (EN/HI/TE)
│   │   ├── pages/                 # Home, Movies, WebSeries, Trailers, MovieDetail, Watchlist, Favorites, Login, Admin
│   │   ├── services/              # Axios API instances & service functions
│   │   ├── utils/                 # Translations dictionary & YouTube embed helpers
│   │   ├── App.jsx                # Router setup
│   │   ├── main.jsx               # React DOM entry
│   │   └── index.css              # Dark cinema UI styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                   # Root orchestrator with concurrently ("npm run dev")
└── README.md
```

---

## 🚀 Quick Start (Local Setup for Project Evaluation)

### 1. Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (Local MongoDB Server or MongoDB Atlas connection string)

### 2. Install Dependencies
In the root directory, install all dependencies for root, server, and client:
```bash
npm run install:all
```

### 3. Seed the Database
Populate MongoDB with the 15+ curated movies, web series, and test users:
```bash
npm run seed
```

### 4. Start the Application
Run both the Backend (Express on port 5000) and Frontend (Vite React on port 5173) with a single command:
```bash
npm run dev
```

* **Frontend App:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔑 Login & Evaluation Credentials

### Regular User:
* **Username:** `Ranjna Ray`
* **Password:** `ranjna123`

### Admin Dashboard:
* **Route:** Navigate to [http://localhost:5173/admin](http://localhost:5173/admin)
* **Security Key (Password):** `ranjna@123`

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Backend status check | Public |
| `GET` | `/api/movies` | Get movies (filter by genre, language, type, sort, search) | Public |
| `GET` | `/api/movies/:id` | Get single movie details | Public |
| `POST` | `/api/movies` | Create new movie/series | Admin Only |
| `PUT` | `/api/movies/:id` | Update movie details | Admin Only |
| `DELETE` | `/api/movies/:id` | Delete movie record | Admin Only |
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login user & receive JWT | Public |
| `POST` | `/api/auth/admin-login` | Verify admin password & receive token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Private |
| `GET` | `/api/users/watchlist` | Get user watchlist | Private |
| `POST` | `/api/users/watchlist/:id` | Toggle movie in watchlist | Private |
| `GET` | `/api/users/favorites` | Get user favorites | Private |
| `POST` | `/api/users/favorites/:id` | Toggle movie in favorites | Private |
