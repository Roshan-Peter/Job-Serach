# Job Search Platform

A modern job listing and recruitment platform built with Node.js, Express, MongoDB, and EJS.

Users can browse jobs, create accounts, post job opportunities, and apply using either Easy Apply or external application links.

---

# Features

## Authentication
- Session-based authentication
- Persistent login sessions using MongoDB session store
- OTP email verification during account registration
- Password hashing and secure login flow

## Job Platform
- Create and manage job postings
- Public job listings
- Detailed job pages
- Easy Apply support
- External application links
- Responsive Bootstrap UI

## Technical Features
- MongoDB database integration
- EJS templating engine
- MVC architecture
- Flash/error handling
- Responsive design

---

# Tech Stack

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Frontend
- EJS
- Bootstrap 5
- Bootstrap Icons

## Authentication & Sessions
- express-session
- connect-mongo

---

# OTP Verification

The project includes OTP verification during account registration.

Currently:
- OTPs are generated server-side
- OTPs are logged in the console for development/testing


---

# Project Structure

```bash
.
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── views/
│   ├── partials/
│   └── jobs/
├── server.js
├── package.json
└── README.md
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/Roshan-Peter/Job-Serach.git
cd JobSearch
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/jobsearch

SESSION_SECRET=your_secret_key

NODE_ENV=development
```

---

## 4. Start MongoDB

Ensure MongoDB is running locally.

Example:

```bash
mongod
```

---

# Running the Application

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

---

# Main Routes

## Authentication

| Method | Route | Description |
|---|---|---|
| GET | `/login` | Login page |
| GET | `/register` | Register page |
| POST | `/login` | Login user |
| POST | `/register` | Register user |
| POST | `/verify-otp` | Verify OTP |

---

## Jobs

| Method | Route | Description |
|---|---|---|
| GET | `/jobs` | List all jobs |
| GET | `/jobs/create` | Show create form |
| POST | `/jobs` | Create new job |
| GET | `/jobs/:id` | View single job |
| DELETE | `/jobs/:id` | Delete job |

---

# Session Persistence

User sessions are stored in MongoDB using `connect-mongo`.

This allows:
- Persistent login sessions
- Sessions surviving server restarts
- Scalable session storage

Example setup:

```js
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}));
```

---

# Future Improvements

- Email OTP delivery
- Password reset
- Resume uploads
- Job search and filtering
- Company profiles
- Saved jobs
- Admin dashboard
- Notifications
- Pagination
- Rich text editor
- Real-time messaging

---

# License

MIT License

---

# Author

Roshan Peter