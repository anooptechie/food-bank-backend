const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/userModel");

// helper (same pattern as your auth test)
const loginAndGetToken = async (email, password) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};

describe("Inventory Operations", () => {
  let token;
  let itemId;

  beforeEach(async () => {
    // create admin
    await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    token = await loginAndGetToken("admin@test.com", "password123");

    // create inventory item
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

  it("increments inventory correctly", async () => {
    const res = await request(app)
      .patch(`/api/inventory/${itemId}/increment`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.quantity).toBe(15);
  });

  it("prevents negative inventory", async () => {
    const res = await request(app)
      .patch(`/api/inventory/${itemId}/decrement`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100 });

    expect(res.statusCode).toBe(400);
  });
});