
# CyberSecurityAwareness
Website to raise awareness on Cyber Security


This repository contains the **Express.js** backend for the Cybersecurity Awareness Website. It provides RESTful API endpoints for authentication, quizzes, feedback, and email verification/reset flows.

## 📦 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── Controllers/
│   │   └── AuthController.js  # Auth, OTP, password reset logic
│   ├── Middleware/
│   │   ├── userAuth.js        # JWT authentication
│   │   ├── otpRateLimiter.js  # Rate limiting for OTP endpoints
│   │   └── errorHandler.js    # Global error handler
│   ├── Models/
│   │   └── UserModel.js       # Mongoose user schema
│   ├── Routes/
│   │   └── AuthRoutes.js      # /api/auth routes
│   ├── Config/
│   │   └── nodemailer.js      # Email transporter
│   ├── app.js                 # Express app setup
│   └── server.js              # Start server
├── .env                       # Environment variables
├── package.json               # Dependencies & scripts
└── README_Backend.md          # This file
```

## ⚙️ Prerequisites

* Node.js v14+
* npm or yarn
* MongoDB Atlas account (or local MongoDB)
* SMTP credentials for sending email (Gmail, SendGrid, etc.)

## 🔧 Installation

1. Clone the repo:

   ```bash
   git clone <repo-url> backend
   cd backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create a `.env` in project root with:

   ```env
   PORT=3000
   NODE_ENV=development
   MONGO_URI=<your-mongo-uri>
   JWT_SECRET=<your-jwt-secret>
   SENDER_EMAIL=<your-email>
   EMAIL_PASSWORD=<your-email-password>
   FRONTEND_ORIGIN=http://localhost:5173
   ```

## 🚀 Running the Server

* **Development** (with auto-restart):

  ```bash
  npm run dev  # uses nodemon
  ```
* **Production**:

  ```bash
  npm run start
  ```

## 🛣️ Available Endpoints

| Method | Route                       | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| GET    | `/api/auth/me`              | Get current user ID (protected)     |
| POST   | `/api/auth/register`        | Register new user                   |
| POST   | `/api/auth/login`           | Login and receive JWT cookie        |
| POST   | `/api/auth/logout`          | Clear auth cookie                   |
| POST   | `/api/auth/send-verify-otp` | Send email verification OTP         |
| POST   | `/api/auth/verify-otp`      | Verify account OTP                  |
| POST   | `/api/auth/send-reset-otp`  | Send password reset OTP             |
| POST   | `/api/auth/reset-password`  | Verify reset OTP & set new password |

## 🔒 Security & Validation

* Passwords are hashed with bcrypt.
* JWT stored in HttpOnly cookie.
* Rate limiter on OTP endpoints (`express-rate-limit`).
* Input validation and error handling via middleware.

## 📋 Scripts

* `npm run dev` – Start development server
* `npm run start` – Run production server

---

*Maintained by Abdullah

