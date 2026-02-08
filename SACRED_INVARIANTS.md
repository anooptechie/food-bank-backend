# Sacred Invariants

This document defines the **non-negotiable guarantees** of the backend system.

If any invariant listed here breaks, the system is considered **incorrect**, not merely buggy.
All future changes, refactors, and feature additions must preserve these guarantees.

---

## Authentication Invariants

1. **Passwords are never stored in plain text**
   - All passwords must be hashed before persistence.
   - Password fields are never returned in API responses.

2. **Authentication is stateless**
   - All protected routes require a valid JWT.
   - Server does not store session state.

3. **JWT payload is minimal**
   - Tokens contain only the user identifier.
   - No roles or permissions are encoded in the token.

---

## Authorization Invariants

4. **Role-based access control is strictly enforced**
   - `admin` and `volunteer` roles are not interchangeable.
   - Admin-only actions cannot be performed by volunteers.

5. **Deny-by-default update strategy**
   - Only explicitly allowed fields may be updated.
   - Requests containing only forbidden fields must be rejected.

6. **Field-level authorization is enforced in controllers**
   - Authorization is not limited to route-level checks.
   - Business rules are validated inside controller logic.

---

## Data Safety Invariants

7. **Soft-deleted inventory is invisible**
   - Soft-deleted items never appear in queries, listings, or analytics.
   - Soft-deleted items cannot be updated.

8. **Data is never physically deleted**
   - Inventory items are never hard-deleted from the database.

---

## Operational Invariants

9. **Health endpoint is always unauthenticated**
   - `/health` must remain accessible without authentication.
   - No middleware leakage is allowed on this route.

10. **Background jobs must not block HTTP startup**
    - Cron jobs must not prevent the server from starting.
    - Failures in background jobs must not crash the application.

---

## Testing Invariants

11. **Authentication regressions are detected automatically**
    - Auth invariants are protected by automated regression tests.
    - Tests must fail immediately if auth behavior changes.

12. **Tests run against an isolated database**
    - Test execution must never affect development or production data.

---

### Audit Emission Invariant

Any successful inventory UPDATE must emit exactly one audit event
containing accurate before and after state.

- Audit events must never be emitted on failed requests
- Audit events must reflect actual persisted state, not intent
- Audit logic must not block or affect request success

---

## Enforcement

- Some invariants are enforced by automated tests.
- Some are enforced by schema constraints and middleware.
- All invariants are enforced by code review and documentation.

Any change that violates these invariants must be rejected or redesigned.
