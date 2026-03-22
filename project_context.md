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
- JWT (short-lived access tokens)

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

## Authentication (Phase 1 — Hardened)

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

Phase 1 — Auth Hardening Complete

Includes:
- refresh token hashing and rotation
- token reuse detection
- session invalidation via tokenVersion
- rate limiting
- account lockout