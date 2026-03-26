📄 🧪 Testing Challenges & Solutions (DOCUMENTATION)

You can add this to your README under a new section:

🧪 Testing Challenges & How They Were Solved

While implementing integration tests, several real-world issues surfaced.
Each problem required debugging at different layers: environment, infrastructure, and business logic.

1️⃣ Environment Variables Not Loaded

Problem

process.env.MONGO_URI was undefined

Tests crashed with:

Cannot read properties of undefined (reading 'includes')

Root Cause

.env.test was not loaded before test execution

Solution

Configured Jest to load setup file:
setupFilesAfterEnv: ["<rootDir>/tests/testSetup.js"]
Explicitly loaded .env.test using dotenv
2️⃣ Unsafe Database Usage (Production DB Risk)

Problem

Tests were accidentally pointing to MongoDB Atlas

Risk

Could overwrite real production data

Solution

Added safety check:
if (!process.env.MONGO_URI.includes("127.0.0.1")) {
  throw new Error("Tests must run on local database only!");
}

Final Improvement

Replaced with in-memory MongoDB (safer + faster)
3️⃣ MongoDB Not Available in Codespaces

Problem

No local MongoDB instance
Tests hanging on DB connection

Solution

Introduced:
mongodb-memory-server

Benefits

No external DB required
Faster tests
Fully isolated environment
4️⃣ Redis Connection Blocking Tests

Problem

Jest did not exit due to open Redis connection

Error

Jest did not exit one second after test run

Root Cause

Redis connection remained open during tests

Solution

Disabled Redis in test environment:
if (process.env.NODE_ENV === "test") {
  module.exports = null;
}
Added null checks in middleware
5️⃣ Import Order Bug (Critical)

Problem

Redis still connected in test mode

Root Cause

redisClient was imported before setting NODE_ENV=test

Solution

Reordered setup:
process.env.NODE_ENV = "test";
dotenv.config();
const redisClient = require(...);
6️⃣ JWT Configuration Mismatch

Problem

"expiresIn" should be a number or string

Root Cause

Code expected:

ACCESS_TOKEN_EXPIRES_IN

.env.test had:

JWT_EXPIRES_IN

Solution

Standardized env variables
Added fallback in code:
expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
7️⃣ API Response Contract Mismatch

Problem

Tests failed with:
jwt malformed

Root Cause

Login response returned:
accessToken
Tests expected:
token

Solution

Updated response:
token: accessToken
8️⃣ Schema Validation Failures

Problem

POST /inventory → 400

Root Cause

Required fields missing:
minThreshold
expiryDate

Solution

Updated test payload to include all required fields
9️⃣ Response Shape Mismatch

Problem

_id undefined
data.find is not a function

Root Cause

API returned:
data: { item: {...} }
Tests expected:
data: {...}

Solution

Standardized API responses:
data: item
data: items[]
🔟 Concurrency & Idempotency Edge Cases

Problem

Needed to verify:
no race conditions
no duplicate updates

Solution

Wrote integration tests that:
fired parallel requests
reused same Idempotency-Key

Result

Verified system correctness under real-world conditions
💡 Key Takeaways
Most failures were not logic bugs, but:
environment issues
lifecycle issues
contract mismatches
Proper testing requires:
controlled environment
deterministic setup
real integration flows (not mocks)
✅ Outcome
Fully stable test suite
Deterministic test runs
Production-grade reliability guarantees
Confidence in system behavior under:
retries
concurrency
failures