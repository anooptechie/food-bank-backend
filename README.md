# ✅ UPDATED `README.md` (Aligned with Reality)

```md
🏦 Local NGO / Food Bank Management System (Backend)

A production-inspired backend for managing food inventory in old age homes / local NGOs with a strong focus on safety, clarity, and role-based access.

This project is intentionally built step-by-step to learn **real backend engineering**, not shortcuts.

---

## Why This Project?

Many small NGOs still rely on spreadsheets or paper records to manage food inventory, leading to:
- food expiring unnoticed
- poor stock visibility
- accidental overwrites
- lack of accountability

This backend aims to:
- centralize inventory data
- track quantities, thresholds, and expiry dates
- enforce role-based permissions
- prevent unsafe updates
- provide predictable error handling

---

## Tech Stack (V1.1 – Frozen)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

### Authentication
- JWT (short-lived tokens)
- Stateless authentication

### Tooling
- dotenv
- nodemon
- Git & GitHub

⚠️ TypeScript migration planned later.  
This version intentionally uses JavaScript for clarity.

---

## Folder Structure

food-bank-backend/
├── .env
├── package.json
├── README.md
├── DEBUGGING.md
├── PROJECT_CONTEXT.md
├── scripts/
│ └── createAdmin.js
└── src/
├── app.js
├── server.js
├── config/
│ └── db.js
├── models/
│ ├── inventoryModel.js
│ └── userModel.js
├── controllers/
│ ├── inventoryController.js
│ ├── authController.js
│ └── userController.js
├── middlewares/
│ └── authMiddleware.js
├── utils/
│ ├── appError.js
│ └── asyncError.js
└── routes/
├── inventoryRoutes.js
├── authRoutes.js
└── userRoutes.js

yaml
Copy code

---

## Implemented Features

### Inventory Management
- Create inventory items (admin only)
- Safe PATCH updates with allow-list enforcement
- Low stock alerts
- Expiring items alerts (next 7 days)
- Soft delete (no physical removal)

---

### Authentication & Authorization
- JWT-based login
- Short-lived access tokens
- Protected routes
- Role-based authorization (`admin`, `volunteer`)
- Field-level update restrictions

---

### Global Error Handling (V1.1)
- Centralized error handler
- Custom `AppError` for operational errors
- `asyncErrorHandler` for async controllers
- No try/catch in controllers
- Consistent error response format

---

## Environment Variables

PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/foodbank
JWT_SECRET=your_secret
JWT_EXPIRES_IN=15m

yaml
Copy code

---

## Documentation

- README.md – Project overview
- PROJECT_CONTEXT.md – Canonical system snapshot
- DEBUGGING.md – Real bugs and fixes
- docs/adr/ – Architectural decisions

---

## Testing

- Manual testing completed
- All error paths verified
- Auth, authorization, inventory, and global error flow validated

---

## Not Implemented Yet

- Audit logs
- Automated tests
- Frontend integration
- Deployment

---

## Status

✅ **Backend V1.1 Stable**  
Ready for frontend integration.