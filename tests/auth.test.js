const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/userModel");
// const { signToken } = require("../src/controllers/authController");

const loginAndGetToken = async (email, password) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};

// --- Test DB cleanup (critical for isolation) ---
beforeEach(async () => {
  await User.deleteMany({});
});

// --- AUTH REGRESSION TESTS ---

it("allows admin to login with correct password", async () => {
  await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
  });

  // Verify password is hashed (regression guard)
  const storedUser = await User.findOne({ email: "admin@test.com" }).select(
    "+password",
  );
  expect(storedUser.password).not.toBe("password123");

  const res = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "password123",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.token).toBeDefined();
});

it("prevents volunteer creation without admin role", async () => {
  const volunteer = await User.create({
    name: "Volunteer",
    email: "vol@test.com",
    password: "password123",
    role: "volunteer",
  });

  // Token signing is trusted here; login flow is tested above
  const token = await loginAndGetToken("vol@test.com", "password123");

  const res = await request(app)
    .post("/api/users")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "New Volunteer",
      email: "new@test.com",
      password: "password123",
    });

  expect(res.statusCode).toBe(403);
});

it("allows admin to create volunteer", async () => {
  const admin = await User.create({
    name: "Admin",
    email: "admin2@test.com",
    password: "password123",
    role: "admin",
  });

  const token = await loginAndGetToken(
  "admin2@test.com",
  "password123"
);

  const res = await request(app)
    .post("/api/users")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Volunteer 2",
      email: "vol2@test.com",
      password: "password123",
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.data.role).toBe("volunteer");
});

it("rejects access to protected routes without token", async () => {
  const res = await request(app).get("/api/inventory");

  expect(res.statusCode).toBe(401);
});
