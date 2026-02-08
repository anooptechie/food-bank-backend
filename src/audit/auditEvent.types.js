/**
 * Audit Event Contract
 * This service EMITS events only.
 * Storage and processing are owned by the Audit Logging Service.
 */

module.exports = {
  INVENTORY_UPDATED: "INVENTORY_UPDATED",
  INVENTORY_CREATED: "INVENTORY_CREATED",
  INVENTORY_DELETED: "INVENTORY_DELETED",
};
