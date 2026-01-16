const express = require("express");
const inventoryRoutes = require("./routes/inventoryRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");
const cors = require("cors")

// --- SWAGGER ADDITIONS START ---
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load the YAML file you created in Step 2
// This moves UP one directory and then into docs
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
// --- SWAGGER ADDITIONS END ---

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors())

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes); //route mounting
app.use("/api/users", userRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Food Bank API is running");
});

//Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
