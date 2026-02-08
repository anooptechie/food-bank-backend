/**
 * Audit Event Emitter
 * Phase 2: simple synchronous emission (no storage).
 * This can later be replaced with HTTP / queue / Kafka producer.
 */

const emitAuditEvent = (event) => {
  const auditPayload = {
    actorId: event.actorId,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    metadata: event.metadata || {},
    timestamp: new Date().toISOString(),
  };

  // Phase 2: emit only (no persistence)
  console.log("AUDIT_EVENT_EMITTED:", auditPayload);
};

module.exports = emitAuditEvent;
