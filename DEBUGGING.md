🐞 Debugging Notes

This document captures real errors encountered during development and how they were resolved. These notes are intentionally kept separate from the main README to keep project documentation clean while preserving valuable debugging knowledge.

Error: TypeError: argument handler must be a function
When it occurred

While starting the Express server after wiring inventory routes.

Error message
TypeError: argument handler must be a function
Actual root cause

A route was registered using a controller function that had been commented out, causing Express to receive undefined instead of a function during route registration.

Faulty code

inventoryController.js

// exports.testInventory = (req, res) => {
//   res.json({
//     status: "success",
//     message: "Inventory controller is working",
//   });
// };

inventoryRoutes.js

router.get("/test", inventoryController.testInventory);

This effectively resulted in:

router.get("/test", undefined);
Why Express crashed immediately

Express validates route handlers at application startup, not at request time. If a handler is not a function, Express fails fast instead of running a partially broken server.

Fix

Ensure routes and controllers are always kept in sync. Either restore the controller function or remove/comment the route that references it.

exports.testInventory = (req, res) => {c
  res.json({
    status: "success",
    message: "Inventory controller is working",
  });
};
Key learning

Routes and controllers must always be updated together

Commenting out a controller without updating its route will crash the app

Express startup errors usually indicate wiring issues, not business logic problems

📌 This file will grow as more real-world issues are encountered and resolved.