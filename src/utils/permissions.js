const ROLE_PERMISSIONS = {
  admin: [
    "inventory:create",
    "inventory:update",
    "inventory:delete",
    "inventory:read",
    "inventory:analytics",
    "user:create",
  ],
  volunteer: [
    "inventory:read",
    "inventory:update:quantity",
  ],
};

module.exports = ROLE_PERMISSIONS;