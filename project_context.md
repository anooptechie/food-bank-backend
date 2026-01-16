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

- Manual testing only
- Verified:
- auth & authorization
- inventory CRUD
- pagination, filtering, sorting
- analytics
- background jobs
- soft-delete edge cases
- health endpoint

---

## Status

✅ **Backend V1.2 Stable**  
Phase 1 complete.