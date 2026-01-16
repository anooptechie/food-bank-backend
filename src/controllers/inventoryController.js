const InventoryItem = require("../models/inventoryModel");
const asyncErrorHandler = require("../utils/asyncError");
const AppError = require("../utils/appError");

// exports.testInventory = asyncErrorHandler(async (req, res) => {
//   res.json({
//     status: "success",
//     message: "Inventory controller is working",
//   });
// });

// exports.getLowStockItems = asyncErrorHandler(async (req, res) => {
//   try {
//     const lowStockItems = await InventoryItem.find({
//       isDeleted: false,
//       $expr: { $lt: ["$quantity", "$minThreshold"] },
//     });

//     res.status(200).json({
//       status: "success",
//       results: lowStockItems.length,
//       data: {
//         items: lowStockItems,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "Error",
//       message: error.message,
//     });
//   }
// });

// exports.getExpiringItems = asyncErrorHandler(async (req, res) => {
//   try {
//     const today = new Date();

//     const sevenDaysFromNow = new Date();
//     sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

//     const expiringItems = await InventoryItem.find({
//       isDeleted: false,
//       expiryDate: {
//         $gte: today,
//         $lte: sevenDaysFromNow,
//       },
//     });
//     res.status(200).json({
//       status: "success",
//       results: expiringItems.length,
//       data: {
//         items: expiringItems,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "Fail",
//       message: error.message,
//     });
//   }
// });

// exports.addItems = asyncErrorHandler(async (req, res) => {
//   try {
//     const newItem = await InventoryItem.create(req.body);
//     res.status(201).json({
//       status: "success",
//       data: {
//         item: newItem,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// });

// exports.updateInventoryItem = asyncErrorHandler(async (req, res) => {
//   try {
//     //Strict Mode Removed
//     // if (attemptedFields.length > 0) {
//     //   return res.status(400).json({
//     //     status: "Error",
//     //     message: `${attemptedFields.join(", ")} fields are not allowed to be updated.`,
//     //   });
//     // }

//     const role = req.user.role;
//     const adminAllowedFields = ["quantity", "minThreshold", "expiryDate"];
//     const volunteerAllowedFields = ["quantity"];

//     const allowedFields =
//       role === "admin" ? adminAllowedFields : volunteerAllowedFields;

//     // 2. Build updates object safely
//     const updates = {};

//     Object.keys(req.body).forEach((field) => {
//       if (allowedFields.includes(field)) {
//         //“Is the client trying to update a field I explicitly allow for this role?”
//         updates[field] = req.body[field];
//         //Now data moves from req.body to updates. | Now Updates contain safe data fields
//       }
//     });

//     //Silently ignore forbidden fields when something valid exists;
//     //explain clearly when nothing valid exists — in the user’s role language.
//     const allowedFieldsMessage =
//       role === "admin"
//         ? "Only quantity, minThreshold, or expiryDate can be updated"
//         : "Only quantity can be updated";

//     // 3️ Reject empty or invalid updates
//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({
//         status: "fail",
//         message: allowedFieldsMessage,
//       });
//     }

//     // 4️ Update only non-deleted inventory items
//     const updatedItem = await InventoryItem.findOneAndUpdate(
//       { _id: req.params.id, isDeleted: false },
//       updates,
//       {
//         new: true, //returns updated document
//         runValidators: true, //schema rules enforced
//       }
//     );

//     // 5️ Handle not found
//     if (!updatedItem) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Inventory item not found",
//       });
//     }

//     // 6️ Success response
//     res.status(200).json({
//       status: "success",
//       data: {
//         item: updatedItem,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// });

// exports.softDeleteInventoryItem = asyncErrorHandler(async (req, res) => {
//   try {
//     const item = await InventoryItem.findOneAndUpdate(
//       { _id: req.params.id, isDeleted: false },
//       {
//         isDeleted: true,
//         deletedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!item) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Inventory item not found or already deleted",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Inventory item soft deleted successfully",
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// });

exports.testInventory = asyncErrorHandler(async (req, res) => {
  res.json({
    status: "success",
    message: "Inventory controller is working",
  });
});

exports.getLowStockItems = asyncErrorHandler(async (req, res) => {
  const lowStockItems = await InventoryItem.find({
    isDeleted: false,
    $expr: { $lt: ["$quantity", "$minThreshold"] },
  });

  res.status(200).json({
    status: "success",
    results: lowStockItems.length,
    data: {
      items: lowStockItems,
    },
  });
});

exports.getExpiringItems = asyncErrorHandler(async (req, res) => {
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const expiringItems = await InventoryItem.find({
    isDeleted: false,
    expiryDate: {
      $gte: today,
      $lte: sevenDaysFromNow,
    },
  });

  res.status(200).json({
    status: "success",
    results: expiringItems.length,
    data: {
      items: expiringItems,
    },
  });
});

exports.addItems = asyncErrorHandler(async (req, res) => {
  const newItem = await InventoryItem.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      item: newItem,
    },
  });
});

exports.updateInventoryItem = asyncErrorHandler(async (req, res, next) => {
  const role = req.user.role;

  const adminAllowedFields = ["quantity", "minThreshold", "expiryDate"];
  const volunteerAllowedFields = ["quantity"];

  const allowedFields =
    role === "admin" ? adminAllowedFields : volunteerAllowedFields;

  const updates = {};

  Object.keys(req.body).forEach((field) => {
    if (allowedFields.includes(field)) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    const message =
      role === "admin"
        ? "Only quantity, minThreshold, or expiryDate can be updated"
        : "Only quantity can be updated";

    return next(new AppError(message, 400));
  }

  const updatedItem = await InventoryItem.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedItem) {
    return next(new AppError("Inventory item not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      item: updatedItem,
    },
  });
});

exports.softDeleteInventoryItem = asyncErrorHandler(async (req, res, next) => {
  const item = await InventoryItem.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true }
  );

  if (!item) {
    return next(
      new AppError("Inventory item not found or already deleted", 404)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Inventory item soft deleted successfully",
  });
});

// exports.getAllInventory = asyncErrorHandler(async (req, res, next) => {
//   // 1. Fetch all items from the database
//   const items = await InventoryItem.find();

//   // 2. Send the response in the format your React app expects
//   res.status(200).json({
//     status: "success",
//     results: items.length,
//     data: {
//       items: items // This matches data.items in your Inventory.jsx
//     }
//   });
// });

exports.getAllInventoryItems = asyncErrorHandler(async (req, res, next) => {
  /* ---------------- Pagination ---------------- */
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const skip = (page - 1) * limit;

  /* ---------------- Filtering ---------------- */
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.lowStock === "true") {
    filter.$expr = { $lt: ["$quantity", "$minThreshold"] };
  }

  if (req.query.expiringIn) {
    const days = parseInt(req.query.expiringIn, 10);

    if (!isNaN(days)) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      filter.expiryDate = { $lte: futureDate };
    }
  }

  /* ---------------- Sorting ---------------- */
  const allowedSortFields = [
    "createdAt",
    "expiryDate",
    "quantity",
    "name",
    "category",
  ];

  let sort = { createdAt: -1 }; // default

  if (req.query.sort) {
    const sortField = req.query.sort.startsWith("-")
      ? req.query.sort.slice(1)
      : req.query.sort;

    if (allowedSortFields.includes(sortField)) {
      sort = req.query.sort.startsWith("-")
        ? { [sortField]: -1 }
        : { [sortField]: 1 };
    }
  }

  // ---------------- Query ---------------- //
  const items = await InventoryItem.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: items.length,
    data: {
      items,
      page,
      limit,
    },
  });
});

exports.getInventoryAnalytics = asyncErrorHandler(async (req, res, next) => {
  const totalItems = await InventoryItem.countDocuments();

  const lowStockItems = await InventoryItem.countDocuments({
    $expr: { $lt: ["$quantity", "$minThreshold"] },
  });

  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const expiringSoonItems = await InventoryItem.countDocuments({
    expiryDate: { $lte: next7Days },
  });

  const categoryBreakdown = await InventoryItem.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      totalItems,
      lowStockItems,
      expiringSoonItems,
      categoryBreakdown,
    },
  });
});
