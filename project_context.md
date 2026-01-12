# PROJECT_CONTEXT.md

## Project Name
Local NGO / Food Bank Management System (Backend)

---

## Purpose

This document is the **canonical snapshot** of the backend.

It captures:
- stable facts
- final architectural decisions
- verified system behavior

It intentionally excludes:
- debugging steps
- experiments
- rationale (documented separately in ADRs)

---

## Project Scope

A backend system for managing donated food inventory for old age homes / local NGOs, with emphasis on:
- data safety
- predictable behavior
- role-based access control
- centralized error handling

Frontend is **not yet implemented**.

---

## Tech Stack (Frozen – V1.1)

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (short-lived access tokens)
- Git & GitHub

---

## Architecture

- Layered architecture:
  Routes → Middleware → Controllers → Models → Database
- Authentication & authorization enforced via middleware
- Business rules enforced in controllers
- No implicit ORM-side updates
- Centralized error handling via global error middleware

---

## Core Domain Models

### Inventory Item

Fields:
- `name` (String, required)
- `category` (String)
- `quantity` (Number, required, ≥ 0)
- `minThreshold` (Number, required, ≥ 0)
- `expiryDate` (Date, required)
- `isDeleted` (Boolean, default: false)
- `deletedAt` (Date, optional)
- `createdAt`, `updatedAt` (timestamps)

---

### User

Fields:
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, hashed, never returned)
- `role` (Enum: `admin`, `volunteer`)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (timestamps)

---

## Authentication

- JWT-based authentication
- Short-lived access tokens
- Stateless authentication model
- Tokens required for all protected routes
- Token payload contains only `userId`

---

## Authorization

### Roles

**Admin**
- Create inventory items
- Soft delete inventory items
- Create volunteer users
- Update all allowed inventory fields

**Volunteer**
- View inventory alerts
- Update inventory quantity only

### Enforcement

- Route-level authorization via `restrictTo`
- Field-level authorization enforced inside controllers
- Deny-by-default update strategy

---

## Inventory Operations

### Create Inventory Item
- `POST /api/inventory`
- Admin only

### Update Inventory Item
- `PATCH /api/inventory/:id`
- Role-based field allow-list:
  - Admin: `quantity`, `minThreshold`, `expiryDate`
  - Volunteer: `quantity`
- Forbidden fields ignored if at least one valid field exists
- Request rejected if **only forbidden fields** are provided

### Delete Inventory Item
- `DELETE /api/inventory/:id`
- Soft delete (`isDeleted = true`)

### Alerts
- Low stock alerts: `GET /api/inventory/alerts`
- Expiring items (next 7 days): `GET /api/inventory/expiring`

---

## Soft Delete Strategy

- Inventory items are never physically removed
- Deleted items:
  - cannot be updated
  - are excluded from all queries
- Enforced via query middleware + controller filters

---

## Global Error Handling (V1.1)

- Centralized global error handler
- Controllers never send error responses directly
- All expected errors use `AppError`
- All async controllers wrapped with `asyncErrorHandler`
- Errors propagate exclusively via `next(err)`


