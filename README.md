# 🏦 Food Bank Management System (Backend)

A backend system designed to help **old age homes** manage inventory efficiently, reduce food waste, and generate alerts for **low stock** and **expiring items**.

This project is intentionally built **step by step**, with strong emphasis on **fundamentals, clarity, and real-world correctness**.

---

## 📌 Why this project?

Many small old age homes and still rely on Excel sheets or paper to track food inventory. This often leads to:

- food expiring unnoticed
- poor visibility into stock levels
- delayed restocking

This backend aims to:

- centralize inventory data
- track quantities and expiry dates
- expose APIs for alerts and monitoring

---

## 🛠 Tech Stack (v1 – Locked)

### Backend

- **Node.js** – Runtime
- **Express.js** – Web framework
- **MongoDB Atlas** – Cloud database
- **Mongoose** – ODM for MongoDB

### Tooling

- **dotenv** – Environment variables
- **nodemon** – Dev server auto-reload
- **Git & GitHub** – Version control

> ⚠️ TypeScript migration is planned later. This version intentionally uses JavaScript for clarity.

---

## 📂 Current Folder Structure

food-bank-backend/
├── .git/
├── .gitignore
├── .env
├── node_modules/
├── package.json
├── package-lock.json
├── README.md
├── DEBUGGING.md
└── src/
├── app.js
├── server.js
├── config/
│ └── db.js
├── models/
│ └── inventoryModel.js
├── controllers/
│ └── inventoryController.js
└── routes/
└── inventoryRoutes.js

markdown
Copy code

---

## 🧠 File Responsibilities (Beginner Friendly)

### `src/server.js`

- Application entry point
- Loads environment variables
- Establishes MongoDB connection
- Starts the Express server

### `src/app.js`

- Configures Express app
- Registers middleware
- Mounts API routes

### `src/config/db.js`

- Handles MongoDB connection using Mongoose
- Uses async/await with proper error handling
- Prevents the app from running if DB connection fails

### `src/models/inventoryModel.js`

- Defines the Inventory schema
- Enforces data structure and validation

### `src/controllers/inventoryController.js`

- Contains business logic for inventory APIs
- Handles MongoDB queries and response formatting

### `src/routes/inventoryRoutes.js`

- Defines inventory-related endpoints
- Delegates request handling to controllers
- Mounted under `/api/inventory`

---

## ✅ Current Progress

The backend currently supports the following core features:

- ✔️ Project environment and boilerplate setup
- ✔️ MongoDB Atlas connection using Mongoose
- ✔️ Inventory schema design with expiry and threshold tracking
- ✔️ Clean route–controller architecture
- ✔️ `GET /api/inventory/alerts`
  - Returns items where `quantity < minThreshold`
- ✔️ `GET /api/inventory/expiring`
  - Returns items expiring within the next 7 days
- ✔️ API testing and validation using Postman

At this stage, the backend fully supports **inventory alert use cases** for low stock and near-expiry items.

## 🔐 Environment Variables (`.env`)

Stored in the **project root** and never committed to GitHub.

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/foodbank
```
