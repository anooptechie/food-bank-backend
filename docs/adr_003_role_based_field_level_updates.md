# ADR-003: Role-Based Field-Level Update Strategy

## Status
Accepted

---

## Context

The system allows multiple user roles (admin and volunteer) to update inventory items via a shared PATCH endpoint.

Early in development, update logic was based on a **static allow-list** of fields that could be updated by any user. As the system evolved, new requirements emerged:

- Volunteers should be able to update **only stock quantity**
- Admins should be able to update **operational and control fields**
- The same endpoint (`PATCH /api/inventory/:id`) should be reused
- The system should prevent privilege escalation
- Error handling should be clear but not overly verbose

A simple route-level restriction was insufficient because:
- Different roles require different permissions on the *same resource*
- Permissions apply at the **field level**, not the route level

---

## Decision

The system enforces **role-based field-level authorization inside the controller** using **explicit allow-lists**.

Key decisions:
- Field permissions are derived from `req.user.role`
- Only explicitly allowed fields are included in update operations
- Forbidden fields are silently ignored **if at least one valid field exists**
- Requests containing only forbidden fields are rejected
- Error messages are role-aware

---

## Implementation Details

### Role-Based Allow-Lists

- Admin allowed fields:
  ```js
  ["quantity", "minThreshold", "expiryDate"]
  ```

- Volunteer allowed fields:
  ```js
  ["quantity"]
  ```

### Update Construction Logic

- The update object is built dynamically by iterating over `req.body`
- Only fields present in the role-specific allow-list are copied
- The database update operation never consumes `req.body` directly

### Error Handling Rules

- Mixed payloads (valid + invalid fields):
  - Valid fields are applied
  - Invalid fields are ignored

- Invalid-only payloads:
  - Request is rejected with a clear, role-aware message

---

## Consequences

### Positive
- Prevents privilege escalation
- Keeps route structure simple
- Centralizes business rules in controllers
- Scales cleanly with additional roles or fields
- Aligns with deny-by-default security principles

### Negative / Trade-offs
- Slightly more logic inside controllers
- Requires careful testing of edge cases
- Silent ignoring of fields may surprise API consumers if undocumented

---

## Alternatives Considered

### Blacklist-Based Updates
- Explicitly block certain fields
- Rejected due to poor scalability and higher risk of missed fields

### Separate Endpoints Per Role
- Example: `/admin/inventory/:id`
- Rejected due to duplication and unclear ownership of logic

### Middleware-Based Field Authorization
- Rejected to avoid scattering business rules across layers

---

## Notes

This strategy prioritizes:
- explicitness over convenience
- safety over permissiveness
- clarity over implicit behavior

The approach complements existing route-level authorization and enables future extensions such as:
- audit logging
- per-field change tracking
- dynamic permission policies

---

## Date
2026-01-11

