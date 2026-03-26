const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/userModel");

const loginAndGetToken = async (email, password) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};

describe("Idempotency", () => {
  let token;
  let itemId;

  beforeEach(async () => {
    await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    token = await loginAndGetToken("admin@test.com", "password123");

    const res = await request(app)
      .post("/api/inventory")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Rice",
        category: "Food",
        quantity: 10,
        minThreshold: 2,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
      });

    itemId = res.body.data._id;
  });

  it("does not duplicate effect for same idempotency key", async () => {
    const key = "test-key-123";

    const first = await request(app)
      .patch(`/api/inventory/${itemId}/increment`)
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", key)
      .send({ amount: 5 });

    const second = await request(app)
      .patch(`/api/inventory/${itemId}/increment`)
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", key)
      .send({ amount: 5 });

    expect(second.body.data.quantity).toBe(first.body.data.quantity);
  });
});