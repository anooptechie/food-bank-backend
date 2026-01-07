# 🏦 Local NGO / Food Bank Management System (Backend)

A backend system designed to help **local NGOs and food banks** manage inventory efficiently, reduce food waste, and generate alerts for **low stock** and **expiring items**.

This project is intentionally built **step by step**, with strong emphasis on **fundamentals, clarity, and real-world correctness**.

---

## 📌 Why this project?

Many small NGOs still rely on Excel sheets or paper to track food inventory. This often leads to:

* food expiring unnoticed
* poor visibility into stock levels
* delayed restocking

This backend aims to:

* centralize inventory data
* track quantities and expiry dates
* expose APIs for alerts and monitoring

---

## 🛠 Tech Stack (v1 – Locked)

### Backend

* **Node.js** – Runtime
* **Express.js** – Web framework
* **MongoDB Atlas** – Cloud database
* **Mongoose** – ODM for MongoDB

### Tooling

* **dotenv** – Environment variables
* **nodemon** – Dev server auto-reload
* **Git & GitHub** – Version control

> ⚠️ TypeScript migration is planned later. This version intentionally uses JavaScript for clarity.

---

## 📂 Current Folder Structure

```
food-bank-backend/
├── .git/
├── .gitignore
├── .env
├── node_modules/
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── db.js
    ├── models/
    │   └── inventoryModel.js
    ├── routes/
    └── controllers/
```

---

## 🧠 File Responsibilities (Beginner Friendly)

### `src/server.js`

* Application entry point
* Loads environment variables
* Establishes MongoDB connection
* Starts the Express server

```js
connectDB();
app.listen(PORT);
```

---

### `src/app.js`

* Configures Express app
* Registers middleware
* Defines base routes

```js
app.use(express.json());
```

Keeps **app configuration separate** from server startup.

---

### `src/config/db.js`

* Handles MongoDB connection using Mongoose
* Uses `async/await` with proper error handling
* Terminates the app if DB connection fails (fail-fast approach)

```js
await mongoose.connect(process.env.MONGO_URI);
```

---

## 🔐 Environment Variables (`.env`)

Stored in the **project root** and never committed to GitHub.

Example:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/foodbank
```

### Notes

* `foodbank` is the **database name**
* MongoDB creates databases **only when data is inserted**
* Not seeing the database initially in Atlas is expected

---

## 🗄 Database Connection Status

* Existing MongoDB Atlas **M0 (Free Tier)** cluster reused
* Database user configured with **Read and Write** permissions
* Network access allows connections (`0.0.0.0/0`)
* Backend confirms connection via terminal log:

```
MongoDB connected successfully
Server running on port 3000
```

---

## 📦 Inventory Schema

File:

```
src/models/inventoryModel.js
```

### Fields

| Field        | Type   | Description             |
| ------------ | ------ | ----------------------- |
| name         | String | Item name               |
| category     | String | Optional grouping       |
| quantity     | Number | Current stock           |
| minThreshold | Number | Low-stock alert trigger |
| expiryDate   | Date   | Expiry tracking         |
| createdAt    | Date   | Auto-generated          |
| updatedAt    | Date   | Auto-generated          |

MongoDB will automatically create:

* Database: `foodbank`
* Collection: `inventoryitems`

(only after first document insertion)

---

## 🔁 Version Control Practices

* Git initialized early
* `.gitignore` configured correctly
* Sensitive files protected (`.env`, `node_modules`)
* Small, meaningful commits at logical checkpoints
* Code pushed to GitHub regularly

### Example commits

* `Initial backend boilerplate setup`
* `Add inventory item schema`
* `Connect MongoDB using Mongoose`

---

## 🚧 What Is NOT Implemented Yet (By Design)

* ❌ API routes
* ❌ Data insertion
* ❌ Frontend
* ❌ Authentication

The foundation is intentionally solidified first.

---

## ▶️ Next Steps

The next phase focuses on **Backend API Development**:

1. Create inventory routes
2. Insert first inventory item (this will create the DB)
3. Implement:

   * `GET /alerts` (low stock)
   * `GET /expiring` (items expiring in 7 days)
4. Test APIs using Postman

---

## 🧩 Why This Documentation Matters

This README exists to:

* reinforce understanding for beginners
* document decisions clearly
* make debugging easier
* help future contributors (or future-you)
* demonstrate professional workflow

Documentation is treated as a **first-class citizen**, not an afterthought.

---

📌 *This README will be updated as the project evolves.*
