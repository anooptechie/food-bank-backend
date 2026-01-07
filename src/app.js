const express = require("express");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use("/api/inventory", inventoryRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Food Bank API is running");
});

module.exports = app;
