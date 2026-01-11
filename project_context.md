# PROJECT_CONTEXT.md

## Project Name
Local NGO / Food Bank Management System (Backend)

---

## Purpose

This document serves as the **canonical snapshot** of the project.

It captures:
- stable facts
- final decisions
- current system capabilities

It intentionally excludes:
- debugging steps
- trial-and-error attempts
- rationale (covered by ADRs)

---

## Project Scope

A backend system for managing donated inventory for old age homes / food banks, with a strong focus on:
- data safety
- controlled access
- role-based operations

No frontend integration is implemented yet.

---

## Tech Stack (Current)

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (JSON Web Tokens)
- Git & GitHub

---

## Architecture

- Layered architecture:
  - Routes → Controllers → Models → Database
- Business rules enforced in controllers
- Authentication and authorization enforced via middleware
- No ORM-side implicit updates

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
- `createdAt`, `updatedAt` (timestamps)

### User

Fields:
- `name` (String)
- `email` (String, unique)
- `password` (String, hashed)
- `role` (Enum: `admin`, `volunteer`)
- `createdAt`, `updatedAt` (timestamps)

---

## Authentication

- JWT-based authentication
- Short-lived access tokens
- Stateless authentication model
- Tokens are required for all protected routes

---

## Authorization

### Roles

- **Admin**
  - Create inventory items
  - Delete inventory items (soft delete)
  - Create volunteer users
  - Update all allowed inventory fields

- **Volunteer**
  - View inventory alerts
  - Update inventory quantity only

### Enforcement

- Route-level authorization via `restrictTo`
- Field-level authorization enforced inside controllers

---

## Inventory Operations

### Create Inventory Item

- `POST /api/inventory`
- Admin only

### Update Inventory Item

- `PATCH /api/inventory/:id`
- Role-based field permissions:
  - Admin: `quantity`, `minThreshold`, `expiryDate`
  - Volunteer: `quantity`
- Forbidden fields are ignored if at least one valid field exists
- Requests with only forbidden fields are rejected

### Delete Inventory Item

- `DELETE /api/inventory/:id`
- Soft delete using `isDeleted = true`

### Alerts

- Low stock alerts: `GET /api/inventory/alerts`
- Expiring items: `GET /api/inventory/expiring`

---

## Soft Delete Strategy

- Inventory items are never physically removed
- Deleted items:
  - are excluded from queries
  - cannot be updated
- Query middleware ensures deleted records are filtered automatically

---

## User Management

- No public signup
- Initial admin created via one-time bootstrap script
- Volunteers created only by admin users

---

## Documentation

- `README.md` – Project overview
- `PROJECT_CONTEXT.md` – Canonical snapshot (this file)
- `ADR-001` – Soft Delete Strategy
- `ADR-002` – Authentication & Authorization Strategy
- `ADR-003` – Role-Based Field-Level Updates
- `DEBUGGING.md` – Real errors and resolutions

---

## Not Implemented Yet

- Audit / inventory history
- Automated tests
- Frontend
- Deployment

---

## Status

Active development

