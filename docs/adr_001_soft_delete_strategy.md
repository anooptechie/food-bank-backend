# ADR-001: Soft Delete Strategy for Inventory Items

## Status
Accepted

---

## Context

The system manages inventory for old age homes food banks, where items such as food grains, supplies, and donated goods are tracked over time.

In this domain:
- Inventory data may be updated frequently by different roles (admin, volunteer)
- Accidental deletion of records can cause loss of accountability
- Historical context (that an item once existed) can be important for audits and troubleshooting

Initially, a **hard delete** (`DELETE` removing the document entirely) was considered for inventory items.

However, several risks were identified:
- Permanent data loss due to accidental deletes
- Inability to trace who deleted an item
- Difficulty debugging issues related to missing inventory
- No way to distinguish between "never existed" and "deleted"

---

## Decision

The system uses a **soft delete** strategy for inventory items.

Instead of removing documents from the database:
- An `isDeleted: true` flag is set on the inventory item
- Deleted items are treated as inactive

Key rules:
- Soft-deleted items:
  - cannot be updated
  - do not appear in normal query results
- Application queries automatically exclude deleted items
- Controllers explicitly guard against updates on deleted records

---

## Implementation Details

- Inventory schema includes:
  ```js
  isDeleted: {
    type: Boolean,
    default: false,
  }
  ```

- Delete operation:
  - Uses `findOneAndUpdate` instead of `findByIdAndDelete`
  - Sets `isDeleted = true`

- Update operations:
  - Filter includes `{ isDeleted: { $ne: true } }`
  - Prevents updates on deleted records

- Query middleware:
  - Automatically excludes `{ isDeleted: true }` from all `find` queries

---

## Consequences

### Positive
- Prevents accidental data loss
- Enables safer experimentation and learning
- Aligns with real-world inventory and audit requirements
- Makes debugging and future audit logging possible

### Negative / Trade-offs
- Database may grow over time due to retained records
- Requires consistent query filtering to avoid exposing deleted items
- Hard deletes may still be required later for archival or compliance

---

## Alternatives Considered

### Hard Delete
- Permanently removes inventory items
- Rejected due to risk of irreversible data loss

### Archive Collection
- Move deleted items to a separate collection
- Considered more complex than necessary at the current stage

---

## Notes

This decision intentionally favors **safety and clarity over storage optimization**.

The soft delete strategy also lays the foundation for future features such as:
- audit logs
- inventory history
- admin-level recovery or review

---

## Date
2026-01-11

