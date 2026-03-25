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

### Authentication — Phase 3 (Refresh Tokens)

Phase 3 introduces a complete **session lifecycle** using refresh tokens,
while keeping the backend stateless for request authorization.

#### Implemented
- Short-lived **access tokens** for protected routes
- Long-lived **refresh tokens** for session renewal
- Refresh tokens stored securely on the user record
- Token **rotation** on every refresh request
- Explicit logout support by invalidating refresh tokens

#### Endpoints
- `POST /api/auth/login`
  - Issues an access token and a refresh token

- `POST /api/auth/refresh`
  - Accepts a refresh token
  - Issues a new access token and a new refresh token
  - Invalidates the previous refresh token

- `POST /api/auth/logout`
  - Invalidates the current refresh token

#### Security Notes
- Refresh tokens are never used to access protected resources
- Refresh tokens are single-use and rotated on every refresh
- Logout invalidates the session at the source of truth (database)

#### Intentional Non-Goals
- No cookies (header-based tokens only)
- No Redis or token blacklists
- No multi-device session support
- No OAuth or third-party identity providers


This phase ensures operational correctness without introducing
infrastructure complexity.

### Authentication & Authorization

#### Authentication (Hardened)

- Short-lived **access tokens (JWT)**
- Long-lived **refresh tokens with rotation**
- Refresh tokens are:
  - hashed before storage (SHA-256)
  - single-use and rotated on every refresh
- **Refresh token reuse detection** using `tokenVersion`
- **Session invalidation** on suspected token compromise
- Explicit **logout support**

#### Abuse Protection

- **Rate limiting**
  - Strict limits on `/login`
  - Controlled limits on `/refresh`

- **Account lockout**
  - Locks account after 5 failed login attempts
  - Lock duration: 15 minutes
  - Automatic reset after successful login or expiry

#### Authorization

- Role-based access control (`admin`, `volunteer`)
- Field-level authorization inside controllers
- Deny-by-default update strategy

Phase 4 Auth Hardening Complete

Includes:
- refresh token hashing and rotation
- token reuse detection
- session invalidation via tokenVersion
- rate limiting
- account lockout

Business Logic Reliability (Locked)

Concurrency Safety (Critical Write Operations)
> Atomic inventory updates using MongoDB $inc
> Prevents race conditions under concurrent requests
> Guards against negative inventory values using conditional queries
> Separate operational endpoints:
> PATCH /api/inventory/:id/increment
> PATCH /api/inventory/:id/decrement

Validation Layer
> Request validation using express-validator
> Centralized validation logic in dedicated validator layer
> Controllers remain free of validation concerns
> Ensures only valid data reaches business logic

Service Layer (Domain Layer)
> Business logic extracted into service layer (services/)
> Controllers act as thin HTTP handlers
> Centralized enforcement of domain rules
> Improved maintainability and scalability

Idempotency (Safe Retry Mechanism)
> Idempotent operations for critical endpoints (increment/decrement)
> Supports safe retries using Idempotency-Key header
> Prevents duplicate updates caused by:
> network retries
> client resubmissions
> Responses cached in MongoDB with TTL-based cleanup

📊 Phase 5 Observability

This project includes a production-grade observability setup.

🔹 Logging
Uses Pino for high-performance logging
Structured logs with request context
Environment-based formatting:
Development → readable logs
Production → JSON logs
🔹 Request Tracing
Each request is assigned a unique requestId
Enables tracking across the entire request lifecycle
🔹 Error Handling
Centralized global error handler
All errors are logged with context
Consistent API error responses
🔹 Metrics
Prometheus Metrics

Exposed at:
GET /metrics

📈 Available Metrics
http_requests_total
→ Total number of requests
http_request_duration_ms
→ Request latency histogram
Default Node.js metrics:
CPU usage
Memory usage
Event loop lag

🛡️ Phase 6 Rate Limiting

This project includes a layered rate limiting system to protect the API from abuse and excessive traffic.

🔹 Global Rate Limiting
Applied to all API routes
Limits:
100 requests per 15 minutes per IP
🔹 Strict Rate Limiting

Applied to critical operations:

Update inventory
Decrement inventory
Delete inventory
20 requests per 15 minutes per IP
🔹 Authentication Protection
Login endpoint:
5 requests per 15 minutes
Refresh endpoint:
20 requests per 15 minutes
🔹 Example Response
{
  "status": "error",
  "message": "Too many requests, please try again later"
}
🔹 Logging

All rate limit violations are logged with:

requestId
IP address
route

This enables tracking and debugging of abusive traffic patterns.

🎯 Why Rate Limiting?
Prevents brute-force attacks
Protects critical operations
Improves system stability under load
Essential for production-grade APIs

Phase 6  Caching (Redis)

This project uses Redis to improve performance and reduce database load.

🔹 Redis Setup
Redis is used as an in-memory cache layer
Connected using ioredis

🔹 Cached Endpoints
GET /api/inventory
GET /api/inventory/:id

🔹 How It Works
First request:
DB → Response → Stored in Redis
Subsequent requests:
Redis → Response (no DB hit)

🔹 Cache Key Strategy
cache:<request_url>

🔹 Cache Expiry
TTL = 60 seconds
Ensures automatic refresh of data

🔄 Cache Invalidation

To maintain data consistency, cache is cleared after any write operation:

Increment inventory
Decrement inventory
Update inventory
Delete inventory

🔹 Implementation
await redis.flushall();

⚠️ Note
Current implementation clears entire cache for simplicity
Future optimization can target specific cache keys

🎯 Benefits
Faster response times
Reduced database load
Improved scalability
Production-grade caching strategy