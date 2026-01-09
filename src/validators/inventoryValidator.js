const { body, validationResult } = require("express-validator");

exports.createInventoryValidator = [
  body("name").trim().notEmpty().withMessage("Item name is required"),
  body("category")
    .optional()
    .trim()
    .isString()
    .withMessage("Category must be a string"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must not be negative"),
  body("minThreshold")
    .isInt({ min: 0 })
    .withMessage("minThreshold must not be negative"),
  body("expiryDate")
    .isISO8601()
    .withMessage("Expiry date must be a valid date")
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        throw new Error("Expiry date cannot be in the past");
      }
      return true;
    }),
];

//VALIDATION ERROR HANDLER
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    status: "Error",
    errors: errors
      .array()
      .map((err) => ({ field: err.path, message: err.msg })),
  });
};

// body("name").trim().notEmpty().withMessage("Item name is required")
// chainable functions/ properties/ methods offered by the body object which is intern obtained in the express-validator
//.isISO8601() international standard for representing date and time
//.toDate() I'll turn this string into a Date object so the inventoryController.js can perform math on it (like checking if it's 7 days away).

//.setHours(0, 0, 0, 0) 
//If a user tries to donate an item that expires today (Jan 9th), but it is currently 2:00 PM, the computer sees:
// Current Time: Jan 9, 14:00:00
//User Input (expiryDate): Jan 9, 00:00:00 (Standard default for dates)

//Because 00:00:00 is technically "earlier" than 14:00:00, the computer thinks Jan 9th has already passed and will throw an error. By using .setHours(0,0,0,0), you move the current time back to the very start of the day, making the comparison fair.