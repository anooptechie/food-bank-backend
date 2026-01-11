# ADR-002: Authentication & Authorization Strategy

## Status
Accepted

---

## Context

The system manages inventory operations for local NGOs / food banks where multiple users interact with shared data.

Key requirements identified:
- Only authenticated users should access inventory APIs
- Different roles must have different permissions (admin vs volunteer)
- Public signup should be avoided to prevent unauthorized access
- The system should remain simple, scalable, and easy to reason about

Several authentication approaches were considered, including session-based auth and token-based auth.

---

## Decision

The system uses **JWT-based authentication with short-lived tokens**, combined with **role-based authorization**.

Key decisions:
- Authentication is handled using **JSON Web Tokens (JWTs)**
- Tokens are **short-lived** (e.g., 15 minutes)
- The system is **stateless** with respect to authentication
- There is **no public signup endpoint**
- An initial admin is created using a **one-time bootstrap script**
- Authorization is enforced using role-based middleware and controller-level rules

---

## Implementation Details

### Authentication

- Login endpoint issues a JWT containing:
  ```json
  {
    "id": "<userId>",
    "iat": "<issued_at>",
    "exp": "<expires_at>"
  }
  ```

- JWTs are signed using a server-side secret
- Tokens are validated on each request using authentication middleware (`protect`)
- Short token expiry ensures old tokens naturally become invalid without server-side tracking

### Authorization

- Each user has a `role` field (`admin` or `volunteer`)
- Route-level authorization:
  - Enforced using `restrictTo(...)` middleware
  - Example: inventory deletion is admin-only

- Field-level authorization:
  - Enforced inside controllers
  - Allows fine-grained control over which fields a role may update

---

## Consequences

### Positive
- No server-side session storage required
- Scales well across multiple instances
- Clear separation between authentication and authorization
- Prevents role escalation and unauthorized access
- Aligns with real-world backend patterns

### Negative / Trade-offs
- Logging out does not immediately invalidate existing tokens
- Short-lived tokens may require users to re-authenticate
- More complex than basic session-based authentication

---

## Alternatives Considered

### Session-Based Authentication
- Requires server-side session storage
- Harder to scale horizontally
- Rejected in favor of stateless JWT-based auth

### Long-Lived Tokens
- Simplifies user experience
- Rejected due to increased security risk if tokens are leaked

### Token Blacklisting
- Allows immediate token revocation
- Rejected due to added complexity and state management

---

## Notes

This strategy intentionally favors:
- simplicity over completeness
- statelessness over immediate revocation
- explicit authorization rules over implicit behavior

The design leaves room for future enhancements such as:
- refresh tokens
- logout endpoints
- token versioning

---

## Date
2026-01-11

