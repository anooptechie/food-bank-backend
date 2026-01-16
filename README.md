📦 Inventory / Resource Management System (Backend)

A backend-first Inventory & Resource Management System, originally built for NGOs / food banks, but designed to be domain-flexible and scalable across different resource-based organizations.

This project focuses on real backend engineering concerns like authorization, data safety, scalability, and predictable error handling.

Why This Project?
Inventory and resource tracking is a common backend problem across many domains — from NGOs and warehouses to internal teams managing shared resources.

This project focuses on solving core backend challenges that appear in most inventory systems, such as:

maintaining consistent and accurate state

enforcing access control at the API level

preventing unsafe or partial updates

providing operational visibility through analytics

designing scalable read and write patterns

The goal is not to model a single domain, but to build a reusable backend foundation that can adapt to different resource-based workflows with minimal changes.

Tech Stack (V1.2)
Backend

Node.js

Express.js

MongoDB Atlas

Mongoose

Authentication & Authorization

JWT (short-lived access tokens)

Stateless authentication

Role-based access control (admin, volunteer)

Field-level update restrictions

Tooling

dotenv

nodemon

Git & GitHub

⚠️ TypeScript migration planned later.
This version intentionally uses JavaScript for clarity.

Folder Structure
food-bank-backend/
├── README.md
├── PROJECT_CONTEXT.md
├── DEBUGGING.md
├── package.json
├── .env
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
    ├── utils/
    │   ├── appError.js
    │   └── asyncError.js
    └── routes/
        ├── inventoryRoutes.js
        ├── authRoutes.js
        └── userRoutes.js

Implemented Features
Inventory Management

Create inventory items (admin only)

Safe PATCH updates with allow-list enforcement

Field-level authorization (role-aware)

Soft delete (isDeleted)

Query middleware to exclude deleted items

Inventory Listing (Scalable APIs)

Pagination (page, limit)

Server-side filtering:

category

low stock items

expiring items (N days)

Server-side sorting (controlled allow-list)

Defensive defaults and limits

Inventory Analytics (Admin Only)

Total inventory count

Low stock item count

Expiring soon item count

Category-wise inventory breakdown

Implemented using aggregation pipelines

Endpoint:

GET /api/inventory/analytics

Authentication & Authorization

JWT-based login

Short-lived access tokens

Protected routes

Admin-only and volunteer-level permissions

Role-aware error responses

Global Error Handling

Centralized global error handler

Custom AppError for operational errors

Async error wrapper for controllers

Consistent error response format

No try/catch blocks inside controllers

Environment Variables
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>
JWT_SECRET=your_secret
JWT_EXPIRES_IN=15m

Testing

Manual testing only (intentional)

All major flows verified:

auth & authorization

inventory CRUD

pagination / filtering / sorting

analytics endpoint

global error handling

Real bugs documented in DEBUGGING.md

Documentation

README.md – Project overview

PROJECT_CONTEXT.md – Canonical snapshot of decisions

Not Implemented Yet (Intentional)

Audit logging

Automated tests

Frontend integration

Deployment

TypeScript migration

Status

✅ Backend V1.2 Stable