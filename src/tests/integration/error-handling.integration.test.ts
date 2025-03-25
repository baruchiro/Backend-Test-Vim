import { api, generateTestUser } from "./setup";

describe("Error Handling", () => {
  it("should return 401 when auth token is missing", async () => {
    const response = await api
      .post("/api/notification", {
        userId: 1,
        message: "Test message",
      })
      .catch((error) => error.response);

    expect(response.status).toBe(401);
  });

  it("should return 404 when user does not exist", async () => {
    const response = await api
      .post("/api/notification", {
        userId: 999999,
        message: "Test message",
      })
      .catch((error) => error.response);

    expect(response.status).toBe(404);
    expect(response.data.message).toBe("User not found");
  });

  it("should return 400 when message is missing", async () => {
    const testUser = generateTestUser("missing-message");
    const { data: user } = await api.post("/api/users", testUser);

    const response = await api
      .post("/api/notification", {
        userId: user.userId,
      })
      .catch((error) => error.response);

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Message is required");
  });

  it("should return 400 when no user identifier is provided", async () => {
    const response = await api
      .post("/api/notification", {
        message: "Test message",
      })
      .catch((error) => error.response);

    expect(response.status).toBe(400);
    expect(response.data.message).toBe(
      "User ID, email, or telephone is required"
    );
  });
});
