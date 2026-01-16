PROJECT_CONTEXT.md
Project Name

Inventory / Resource Management System (Backend)

Purpose

This document is the canonical snapshot of the backend.

It captures:

stable facts

final architectural decisions

verified system behavior

It intentionally excludes:

debugging steps

experiments

Project Scope

A domain-flexible backend system for managing inventory or shared resources across different organizations and use cases.

The system is designed to support:

safe and controlled inventory updates

role-based access and permissions

operational visibility via analytics

predictable and consistent error handling

scalable read and write patterns

The initial use case was NGO / food bank inventory management, but no domain-specific assumptions exist in the core logic.

Frontend is not yet implemented.

Tech Stack (Frozen – V1.2)

Node.js

Express.js

MongoDB Atlas

Mongoose

JWT (short-lived access tokens)

Git & GitHub

Architecture

Layered architecture:

Routes → Middleware → Controllers → Models → Database


Authentication and authorization enforced via middleware

Business rules enforced explicitly in controllers

No implicit ORM-side updates

Centralized error handling via global error middleware

Query middleware used for enforcing soft-delete behavior

Core Domain Models
Inventory Item

Fields:

name (String, required)

category (String)

quantity (Number, required, ≥ 0)

minThreshold (Number, required, ≥ 0)

expiryDate (Date, required)

isDeleted (Boolean, default: false)

deletedAt (Date, optional)

createdAt, updatedAt (timestamps)

User

Fields:

name (String, required)

email (String, unique, required)

password (String, hashed, never returned)

role (Enum: admin, volunteer)

isActive (Boolean)

createdAt, updatedAt (timestamps)

Authentication

JWT-based authentication

Short-lived access tokens

Stateless authentication model

Tokens required for all protected routes

Token payload contains only userId

Authorization
Roles

Admin

Create inventory items

Soft delete inventory items

Create volunteer users

Update all allowed inventory fields

Access inventory analytics

Volunteer

View inventory

View inventory alerts

Update inventory quantity only

Enforcement

Route-level authorization via restrictTo

Field-level authorization enforced inside controllers

Deny-by-default update strategy

Role-aware error messages

Inventory Operations
List Inventory Items

GET /api/inventory

Supports:

pagination (page, limit)

filtering (category, low stock, expiring items)

sorting (controlled allow-list)

Create Inventory Item

POST /api/inventory

Admin only

Update Inventory Item

PATCH /api/inventory/:id

Role-based field allow-list:

Admin: quantity, minThreshold, expiryDate

Volunteer: quantity

Forbidden fields ignored if at least one valid field exists

Request rejected if only forbidden fields are provided

Delete Inventory Item

DELETE /api/inventory/:id

Soft delete (isDeleted = true)

Inventory Analytics (Admin Only)

GET /api/inventory/analytics

Provides aggregated operational insights:

total inventory item count

low stock item count

expiring-soon item count (next 7 days)

category-wise inventory breakdown

Implemented using aggregation queries

Alerts

Low stock alerts:

Quantity below minimum threshold

Expiring items alerts:

Items expiring within the next 7 days

Soft Delete Strategy

Inventory items are never physically removed

Deleted items:

cannot be updated

are excluded from all queries

Enforced via query middleware and controller-level guards

Global Error Handling (V1.2)

Centralized global error handler

Controllers never send error responses directly

All expected errors use AppError

All async controllers wrapped with asyncErrorHandler

Errors propagate exclusively via next(err)

Consistent error response format across the API

Testing Strategy

Manual testing only (intentional)

Verified flows:

authentication and authorization

inventory CRUD

pagination, filtering, and sorting

analytics endpoints

global error handling

Real-world bugs and fixes documented in DEBUGGING.md

Status

✅ Backend V1.2 Stable

Notes

This project is intentionally backend-first.
Deployment, audit logging, and automated tests are deferred to later phases.