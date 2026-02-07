const dotenv = require("dotenv");

// Load correct env file based on NODE_ENV
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

const app = require("./app");
const connectDB = require("./config/db");

// Connect to database
connectDB();

// ❗ Do NOT start cron jobs during tests
if (process.env.NODE_ENV !== "test") {
  require("./jobs/inventoryAlertsJob");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} [${process.env.NODE_ENV || "dev"} mode]`,
  );
});
