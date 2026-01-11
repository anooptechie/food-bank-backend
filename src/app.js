const express = require("express");
const inventoryRoutes = require("./routes/inventoryRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes); //route mounting
app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Food Bank API is running");
});

module.exports = app;
