const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/userModel");

const loginAndGetToken = async (email, password) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res.body.token;
};

describe("Concurrency Safety", () => {
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

  it("handles concurrent updates safely", async () => {
    const requests = [];

    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app)
          .patch(`/api/inventory/${itemId}/increment`)
          .set("Authorization", `Bearer ${token}`)
          .send({ amount: 1 })
      );
    }

    await Promise.all(requests);

    const res = await request(app)
      .get("/api/inventory")
      .set("Authorization", `Bearer ${token}`);

    const item = res.body.data.find(i => i._id === itemId);

    expect(item.quantity).toBe(20);
  });
});