🏦 Local NGO / Food Bank Management System (Backend)

A backend system designed to help old age homes / local NGOs manage inventory efficiently, reduce food waste, and maintain accountable, role-based access to inventory operations.

This project is intentionally built step by step, focusing on:

correctness over shortcuts

real-world backend patterns

security and authorization

📌 Why this project?

Many small NGOs and old age homes still rely on Excel sheets or paper to track food inventory. This often leads to:

food expiring unnoticed

poor visibility into stock levels

accidental overwrites or untracked updates

no accountability on who changed what

This backend aims to:

centralize inventory data

track quantities, thresholds, and expiry dates

enforce role-based access (admin vs volunteer)

prevent unsafe or accidental updates

🛠 Tech Stack (v1 – Locked)
Backend

Node.js – Runtime

Express.js – Web framework

MongoDB Atlas – Cloud database

Mongoose – ODM for MongoDB

Tooling

dotenv – Environment variables

nodemon – Dev server auto-reload

Git & GitHub – Version control

⚠️ TypeScript migration is planned later. This version intentionally uses JavaScript for clarity.

📂 Current Folder Structure
food-bank-backend/
├── .env
├── package.json
├── README.md
├── DEBUGGING.md
├── PROJECT_CONTEXT.md
├── scripts/
│   └── createAdmin.js
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── inventoryModel.js
    │   └── userModel.js
    ├── controllers/
    │   ├── inventoryController.js
    │   ├── authController.js
    │   └── userController.js
    ├── middlewares/
    │   └── authMiddleware.js
    └── routes/
        ├── inventoryRoutes.js
        ├── authRoutes.js
        └── userRoutes.js
🧠 File Responsibilities (High-Level)
src/server.js

Application entry point

Loads environment variables

Connects to MongoDB

Starts the HTTP server

src/app.js

Configures Express

Registers global middleware

Mounts all API routes

src/models/*

Mongoose schemas

Data validation and defaults

Password hashing via model middleware

src/controllers/*

Business logic

Role-aware update rules

Explicit allow-list based updates

src/middlewares/authMiddleware.js

JWT authentication (protect)

Role-based authorization (restrictTo)

✅ Implemented Features
Inventory Management

Create inventory items (admin only)

Low-stock alerts

GET /api/inventory/alerts

Returns items where quantity < minThreshold

Expiring items alerts

GET /api/inventory/expiring

Returns items expiring within the next 7 days

Safe Updates (PATCH)

PATCH /api/inventory/:id

Allow-list based updates

Role-aware field permissions:

Role	Allowed Fields
Admin	quantity, minThreshold, expiryDate
Volunteer	quantity

Forbidden fields are ignored if at least one valid field exists

Requests with only forbidden fields are rejected

Soft Delete

Inventory items are soft deleted using an isDeleted flag

Deleted items:

cannot be updated

do not appear in queries

Query middleware ensures deleted records are excluded by default

Authentication & Authorization

JWT-based authentication

Short-lived tokens (stateless auth)

No public signup

Admin is created via a one-time bootstrap script

Admin-only volunteer creation

🔐 Environment Variables (.env)

Stored in the project root and never committed to GitHub.

PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/foodbank
JWT_SECRET=your_secret
JWT_EXPIRES_IN=15m
📄 Documentation Files

README.md – Project overview and current feature set

PROJECT_CONTEXT.md – Canonical project decisions and scope

DEBUGGING.md – Real errors encountered and how they were resolved

🚧 Not Implemented Yet

Audit / change history

Automated tests

Frontend integration

Deployment

🧭 Design Philosophy

Deny-by-default updates

Explicit allow-lists over blacklists

Clear separation of auth, authorization, and business logic

Prefer clarity over cleverness

This project is intentionally built as a learning-focused but production-inspired backend.