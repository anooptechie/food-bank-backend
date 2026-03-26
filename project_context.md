## Project Name

Inventory / Resource Management System (Backend)

---

## Purpose

This document is the canonical snapshot of the backend system.

It captures:

- stable facts
- final architectural decisions
- verified system behavior

It intentionally excludes:

- experiments
- debugging steps
- future plans

---

## Project Scope

A domain-flexible backend system for managing inventory or shared resources across different use cases.

The system is designed to support:

- safe and controlled inventory updates
- role-based access and permissions
- operational visibility via analytics
- predictable and consistent error handling
- scalable read and write patterns

The initial use case was NGO / food bank inventory management, but no domain-specific assumptions exist in the core logic.

---

## Tech Stack (Frozen – V1.2)

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (access + refresh tokens with rotation)
- Redis (caching layer)
- Jest + Supertest (integration testing)
- mongodb-memory-server (test database)

---

## Architecture

- Layered architecture:
  Routes → Middleware → Controllers → Models → Database

- Stateless authentication
- Authorization enforced at route and controller levels
- Business rules enforced explicitly in controllers
- Centralized global error handling
- Query middleware enforces soft delete behavior

---

## Core Domain Models

### Inventory Item

- name (String, required)
- category (String)
- quantity (Number, ≥ 0)
- minThreshold (Number, ≥ 0)
- expiryDate (Date)
- isDeleted (Boolean)
- deletedAt (Date)
- createdAt, updatedAt (timestamps)

---

### User

- name (String)
- email (String, unique)
- password (hashed)
- role (`admin`, `volunteer`)
- isActive (Boolean)
- createdAt, updatedAt

---

## Authentication

- JWT-based authentication
- Short-lived access tokens
- Stateless backend
- Token payload contains only user ID

---

## Authorization

### Roles

**Admin**

- Create inventory items
- Update all allowed inventory fields
- Soft delete inventory items
- Create volunteer users
- Access inventory analytics

**Volunteer**

- View inventory
- Update inventory quantity only

---

### Enforcement

- Route-level authorization using `restrictTo`
- Field-level authorization inside controllers
- Deny-by-default update strategy
- Role-aware error messages

---

## Inventory Operations

### List Inventory

- `GET /api/inventory`
- Supports pagination, filtering, and sorting

### Create Inventory Item

- `POST /api/inventory`
- Admin only

### Update Inventory Item

- `PATCH /api/inventory/:id`
- Role-based field allow-list
- Requests with only forbidden fields are rejected

### Delete Inventory Item

- `DELETE /api/inventory/:id`
- Soft delete only

---

## Inventory Analytics (Admin Only)

- `GET /api/inventory/analytics`
- Provides:
- total item count
- low stock count
- expiring-soon count
- category-wise breakdown
- Implemented using aggregation queries

---

## Background Jobs

- Cron-based background job registered at server startup
- Runs independently of HTTP requests
- Identifies:
- low stock items
- expiring items within 7 days
- Alerts logged to console only

---

## Operational Endpoints

### Health Check

- `GET /health`
- Returns:
- service status
- process uptime
- timestamp
- No authentication required

---

## Soft Delete Strategy

- Inventory items are never physically removed
- Deleted items:
- cannot be updated
- are excluded from queries
- Enforced via query middleware and controller guards

---

## Global Error Handling

- Centralized global error handler
- All expected errors use `AppError`
- Async controllers wrapped with `asyncErrorHandler`
- Controllers never send error responses directly

---

## Testing Strategy

## Auth Regression Protection

The system includes a **minimal regression test suite** to guard critical authentication and authorization behavior.

These tests intentionally focus only on **security-critical invariants**, not full feature coverage.

### Protected Guarantees

- Passwords are always hashed before persistence
- Login works end-to-end using real credentials and JWT issuance
- Protected routes reject requests without valid tokens
- Role-based access control is enforced (`admin` vs `volunteer`)
- Volunteers cannot perform admin-only actions (e.g. user creation)

## Testing Strategy

### Auth Regression Protection

The system includes a **minimal regression test suite** to guard critical authentication and authorization behavior.

These tests intentionally focus only on **security-critical invariants**, not full feature coverage.

#### Protected Guarantees

- Passwords are always hashed before persistence
- Login works end-to-end using real credentials and JWT issuance
- Protected routes reject requests without valid tokens
- Role-based access control is enforced (`admin` vs `volunteer`)
- Volunteers cannot perform admin-only actions (e.g. user creation)

#### Testing Approach

- Uses Jest + Supertest
- Tests run against an isolated test database
- No mocking of authentication or authorization layers
- Tokens are obtained via real login flows (no manual signing)
- Database lifecycle is managed explicitly for deterministic runs

This suite acts as a **trip-wire**: if any auth behavior regresses, tests fail immediately.

---

### Manual Verification (Intentional)

In addition to automated auth regression tests, the system has been manually verified for:

- authentication & authorization flows
- inventory CRUD operations
- pagination, filtering, and sorting
- analytics correctness
- background job execution
- soft-delete edge cases
- health endpoint behavior

---

## Status

✅ **Backend V1.2 Stable**  
Phase 1 complete.

## Phase 2 — Audit Event Emission (Locked)

### Goal

Ensure that critical business actions emit reliable, factual audit events
without coupling this service to audit storage or querying.

### Scope

- This service **emits audit events only**
- No audit data is stored or queried here
- This service acts strictly as an **event producer**

### Implemented

- Inventory item **UPDATE** emits an audit event
- Event is emitted **only after successful mutation**
- Event contains:
  - actorId (from authenticated user)
  - action type
  - resource type and ID
  - before and after state
  - timestamp

### Explicit Non-Goals

- No audit event storage
- No audit APIs
- No CREATE or DELETE audit events (deferred intentionally)
- No external audit service integration

### Rationale

Inventory UPDATE was chosen because it is the most complex case
(before/after state, role-based permissions, conditional updates).
Once UPDATE is proven correct, CREATE and DELETE become mechanical extensions.

### Status

Phase 2 is complete, manually verified, and locked.
Future audit expansion will occur in a separate phase.

## Phase 3 — Operations (Locked)

### Goal

Ensure predictable and controllable background job behavior at the service level.

### Implemented

- Explicit start/stop control for inventory alert cron job
- Environment-based enablement (`ENABLE_INVENTORY_ALERTS_JOB`)
- Graceful shutdown handling (`SIGINT`, `SIGTERM`)

### Explicit Non-Goals

- No job queues or workers
- No retries or persistence
- No overlap with the Background Job Processing System project

### Status

Phase 3 is complete and locked.

## Phase 3 — Authentication Lifecycle (Locked)

### Goal

Introduce a secure and explicit session lifecycle while preserving
stateless request authorization.

### Scope

- Short-lived access tokens for API access
- Long-lived refresh tokens for session renewal
- Refresh token rotation to prevent replay attacks
- Explicit logout semantics

### Implemented

- Access tokens expire quickly and are never persisted
- Refresh tokens are:
  - stored on the user record
  - single-use
  - rotated on every refresh request
- Refresh endpoint verifies:
  - token signature
  - token ownership (database match)
- Logout invalidates the refresh token at the source of truth

### Explicit Non-Goals

- No cookie-based authentication
- No refresh token reuse detection beyond rotation
- No multi-device or multi-session support
- No external identity providers
- No token blacklist or cache layer

### Security Invariants

- Access tokens must never be long-lived
- Refresh tokens must never access protected resources
- Refresh tokens must be rotated on every use
- Logout must invalidate the refresh token at the database level

### Status

Authentication lifecycle is complete, manually verified, and locked.

## Authentication (Phase 3 — Hardened)

The system implements a **secure, defensive authentication model**
with explicit session lifecycle management and abuse protection.

### Token Strategy

- Short-lived **access tokens** (JWT)
- Long-lived **refresh tokens** for session renewal
- Refresh tokens are:
  - **hashed before storage** (SHA-256)
  - **single-use (rotated on every refresh)**
  - validated against database state

### Session Security

- **Refresh Token Rotation**
  - Each refresh invalidates the previous token

- **Refresh Token Reuse Detection**
  - Token mismatch triggers:
    - session invalidation
    - token version increment

- **Token Versioning (`tokenVersion`)**
  - Embedded inside refresh tokens
  - Ensures old tokens cannot be reused after rotation

- **Explicit Logout**
  - Removes refresh token from database

### Abuse Protection

- **Rate Limiting**
  - `/login` → strict limit (prevents brute force)
  - `/refresh` → moderate limit (prevents token abuse)

- **Account Lockout**
  - After 5 failed login attempts:
    - account is locked for 15 minutes
  - Lock is:
    - enforced before password validation
    - reset after successful login
    - auto-cleared after expiry

### Security Invariants

- Refresh tokens must never be stored in plain text
- Refresh tokens must never be reused
- Access tokens must remain short-lived
- Failed login attempts must be tracked and limited
- Session compromise must result in invalidation

Phase 3 — Auth Hardening Complete

Includes:
- refresh token hashing and rotation
- token reuse detection
- session invalidation via tokenVersion
- rate limiting
- account lockout

Phase 4 — Business Logic Reliability (Locked)
Goal
Ensure system correctness under real-world conditions such as:
> concurrent updates
> invalid input
> duplicate requests (retries)

Implemented
> Concurrency Safety
> Atomic inventory updates using MongoDB $inc
> Conditional updates ($gte) prevent negative stock
> Separate operational endpoints for stock mutations:
> increment
> decrement

Validation Layer
> Request validation using express-validator
> Validation logic separated from controllers
> Standardized error responses for invalid inputs

Service Layer (Domain Layer)
> Business logic centralized in service layer
> Controllers act as request/response handlers only
> Domain rules enforced consistently across operations
> Audit events triggered from service layer after successful mutations

Idempotency
> Idempotent handling for critical write operations
> Client-provided Idempotency-Key used for request deduplication
> Responses stored and replayed for duplicate requests
> TTL-based automatic cleanup of stored keys

Key Guarantees
> No race conditions during concurrent inventory updates
> No invalid or negative stock states
> Duplicate requests do not cause duplicate effects
> Business rules enforced consistently across the system

Explicit Non-Goals
> No distributed locking
> No external cache (e.g., Redis) for idempotency
> No cross-service idempotency guarantees

Status
Phase 4 is complete, verified, and locked.

Phase 5 — Observability & Monitoring (Completed)
🎯 Goal

Make the system:

Traceable
Debuggable
Observable

✅ Implemented Features

1️⃣ Request Logging
Middleware-based logging for every request
Captures:
HTTP method
URL
status code
response time

2️⃣ Request Tracing
Unique requestId generated per request
Propagated across:
middleware
controllers
services
Enables end-to-end request tracking

3️⃣ Structured Logging (Pino)
Replaced console.log with Pino logger
Environment-based behavior:
Development → pretty logs
Production → JSON logs
Includes contextual metadata:
requestId
route
status
duration

4️⃣ Centralized Error Handling
Errors handled in a global error handler
All errors logged in one place
Consistent error response format

5️⃣ Metrics Collection
🔹 In-Memory Metrics (Initial Implementation)
Tracked:
total requests
error count
latency
Exposed via /metrics endpoint

🔹 Prometheus Integration
Integrated prom-client
Added:
http_requests_total (counter)
http_request_duration_ms (histogram)
Exposed Prometheus-compatible metrics endpoint

🧠 Observability Stack
Request → Logger → Metrics → Error Handler

🎯 Outcome
Improved debugging capability
Real-time system visibility
Production-ready logging system
Foundation for monitoring dashboards (Grafana)

Phase 6 — Rate Limiting & API Protection (Completed)
🎯 Goal

Protect the system from:

Abuse
Brute-force attacks
Excessive traffic

✅ Implemented Features

1️⃣ Global Rate Limiting
Applied to all API routes
Limits requests per IP
100 requests / 15 minutes
Prevents API abuse and traffic spikes

2️⃣ Strict Rate Limiting (Critical Routes)
Applied to sensitive operations:

Inventory decrement
Inventory update
Inventory delete
20 requests / 15 minutes
Protects high-impact actions from misuse

3️⃣ Authentication Rate Limiting (Existing)
Login endpoint:
5 attempts / 15 minutes
Refresh token endpoint:
20 requests / 15 minutes
Prevents brute-force attacks and token abuse.

4️⃣ Logging Integration
All rate limit violations are logged using structured logging
Includes:
requestId
IP address
route

🧠 Rate Limiting Strategy
Login → Strict limiter (security)
Refresh → Moderate limiter
All APIs → Global limiter
Critical routes → Strict limiter

🎯 Outcome
Improved system security
Protection against abuse and brute force attacks
Controlled traffic handling
Production-grade API safeguards

🟢 Phase 7 — Caching & Cache Invalidation (Completed)
🎯 Goal

Improve system performance and reduce database load by introducing caching while ensuring data consistency.

✅ Implemented Features

1️⃣ Redis Integration
Integrated Redis as an in-memory caching layer
Used ioredis for Redis client
Established connection via redisClient

2️⃣ Read Caching (GET Endpoints)
Implemented caching for read operations:
Get all inventory items
Get inventory item by ID (if applicable)
Cache key strategy:
cache:<request_url>
Middleware-based cache lookup:
If cache exists → return cached response
If not → fetch from DB and store in cache

3️⃣ Cache Storage
Cached full API response (not just DB data)
TTL (Time-To-Live):
60 seconds
Ensures automatic cache expiry

4️⃣ Cache Middleware
Centralized cache handling using middleware
Responsibilities:
Generate cache key
Fetch cached data
Attach cacheKey to res.locals

5️⃣ Cache Invalidation (Write Operations)
Cache cleared after:
Increment
Decrement
Update
Delete

Implemented using:
await redis.flushall();

🧠 Caching Strategy
GET request
 → Check Redis
 → If hit → return cached data
 → If miss → fetch DB → store in cache

WRITE request
 → Update DB
 → Clear cache
🎯 Outcome
Faster API responses
Reduced database load
Improved scalability
Maintained data consistency via invalidation

Phase 7.1 Replaced naive cache invalidation (flushall) with targeted key-based invalidation for improved performance and scalability.

Implemented using targeted cache invalidation:

- Cache keys follow pattern:
  cache:/api/inventory*

- On write operations:
  - matching keys are fetched using Redis KEYS
  - only relevant keys are deleted using DEL

- Ensures:
  - minimal cache disruption
  - better performance
  - scalability compared to full cache flush

Phase 8 - Integration Testing 

The system includes a fully automated integration test suite.

Scope
Authentication flow (login, token validation)
Authorization enforcement (role-based access)
Inventory operations (CRUD + validation)
Concurrency safety (parallel updates)
Idempotency guarantees (duplicate request protection)

Test Environment
In-memory MongoDB (mongodb-memory-server)
Redis disabled during tests
No external dependencies

Guarantees
System behavior is deterministic
Critical invariants are protected against regressions
Backend correctness verified end-to-end

🧠 Architecture Evolution
Phase 9: Async System Upgrade

Introduced BullMQ-based queue system to:

decouple audit logging
offload inventory alert processing
improve API performance

🔄 Before
Request → DB → Audit → Response
🚀 After
Request → DB → Queue → Response
                      ↓
                   Worker → Audit

🧱 Components Added
inventoryQueue
auditQueue
inventoryWorker
auditWorker

⚠️ Challenges Faced
1️⃣ Jest Hanging
Cause: active Redis connections + workers
Fix: disable queues in test env

2️⃣ Mongo Memory Server Timeout
Cause: async processes blocking lifecycle
Fix: isolate background systems

3️⃣ Null Queue Crash
Cannot read properties of null (reading 'add')
Cause: queue disabled but still used
Fix: guard queue calls

4️⃣ Path Issues (worker vs workers)
Cause: incorrect folder naming
Fix: consistent directory structure

✅ Outcome
Fully async processing system
Test-safe architecture
Clean separation of concerns
Production-ready design pattern