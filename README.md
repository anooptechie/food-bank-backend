📦 Inventory / Resource Management System (Backend)

A backend-first **Inventory & Resource Management System**, designed to be **domain-flexible** and reusable across different resource-based use cases (inventory, supplies, assets, etc.).

The project focuses on **core backend engineering concerns** such as authorization, business rules, scalability, operational safety, and predictable error handling.

---

## Why This Project?

Inventory and resource tracking is a common backend problem across many domains.

This project focuses on solving **backend-level challenges** that appear in most inventory systems:

- enforcing access control at the API level
- preventing unsafe or partial updates
- maintaining consistent state with soft deletes
- providing operational visibility via analytics
- designing scalable read and write patterns

The goal is not to model a single domain, but to build a **reusable backend foundation** that can adapt to different workflows with minimal changes.

---

## Tech Stack (V1.2)

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

### Authentication & Authorization

- JWT (short-lived access tokens)
- Stateless authentication
- Role-based access control (`admin`, `volunteer`)
- Field-level authorization inside controllers

### Tooling

- dotenv
- nodemon
- Git & GitHub

---

## Folder Structure

src/
├── app.js
├── server.js
├── config/
│ └── db.js
├── models/
│ ├── inventoryModel.js
│ └── userModel.js
├── controllers/
│ ├── inventoryController.js
│ ├── authController.js
│ └── userController.js
├── middlewares/
│ └── authMiddleware.js
├── utils/
│ ├── appError.js
│ └── asyncError.js
├── jobs/
│ └── inventoryAlertsJob.js
└── routes/
├── inventoryRoutes.js
├── authRoutes.js
└── userRoutes.js

---

## Implemented Features

### Inventory Management

- Create inventory items (admin only)
- Safe PATCH updates using allow-list strategy
- Field-level authorization based on role
- Soft delete (`isDeleted`)
- Query middleware excludes deleted items globally

---

### Inventory Listing (Scalable APIs)

- Pagination (`page`, `limit`)
- Server-side filtering:
  - category
  - low stock items
  - expiring items (N days)
- Server-side sorting (controlled allow-list)
- Defensive defaults and maximum limits

Endpoint:
GET /api/inventory

---

### Inventory Analytics (Admin Only)

- Total inventory item count
- Low stock item count
- Expiring-soon item count (next 7 days)
- Category-wise inventory breakdown
- Implemented using aggregation queries

Endpoint:
GET /api/inventory/analytics

---

### Background Jobs (Async Processing)

- Cron-based background job using `node-cron`
- Runs independently of HTTP requests
- Daily checks for:
  - low stock items
  - expiring items (next 7 days)
- Alerts currently logged (no email/SMS integration)

Purpose:

- Keeps request-response cycle lightweight
- Demonstrates async backend workflows

---

### Operational Endpoints

#### Health Check

GET /health

- Returns service status, uptime, and timestamp
- No authentication required
- Used for operational monitoring and deployment readiness

---

### Authentication & Authorization

- JWT-based login
- Short-lived access tokens
- Protected routes
- Role-based access enforcement
- Role-aware error responses

---

### Global Error Handling

- Centralized global error handler
- Custom `AppError` class
- Async controller wrapper
- No try/catch blocks inside controllers
- Consistent error response format

---

## Environment Variables

PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_secret
JWT_EXPIRES_IN=15m

---

## Testing

### Auth Regression Tests

- A minimal Jest + Supertest suite protects authentication and authorization invariants, including password hashing, role enforcement, and protected routes.

- Manual testing (intentional)
- Verified flows:
  - authentication & authorization
  - inventory CRUD
  - pagination, filtering, and sorting
  - admin analytics
  - background job execution
  - soft-delete edge cases
  - health check endpoint

---

## Not Implemented Yet (Intentional)

- Audit log persistence
- Automated tests
- Frontend integration
- Cloud deployment
- TypeScript migration

---

## Status

✅ **Backend V1.2 Stable**  
Phase 1 completed: scalable APIs, analytics, background jobs, and operational hardening.

---

## Phase 2 — Audit Event Emission

### Audit Events

This service emits audit events for selected business actions.
Audit persistence and analysis are handled by a separate Audit Logging Service.

### Notes

This project is intentionally backend-first.  
All listed features reflect the current implementation exactly.

## Phase 3 — Operations & Background Jobs

Phase 3 focuses on making background job execution predictable,
explicit, and safe at the service level.

### What was implemented
- Inventory alert job no longer starts implicitly on import
- Explicit lifecycle control (`start` / `stop`) for background jobs
- Environment-based enablement using `ENABLE_INVENTORY_ALERTS_JOB`
- Graceful shutdown handling for clean process termination

### How background jobs work
- Background jobs run **only if explicitly enabled**
- Jobs are started by the server at runtime, not on module load
- Jobs are stopped cleanly on shutdown signals (`SIGINT`, `SIGTERM`)
- No background jobs run during tests by default

### Non-goals (intentional)
- No job queues or workers
- No retries or persistence
- No overlap with the separate Background Job Processing System project

This phase ensures operational correctness without introducing
infrastructure complexity.


