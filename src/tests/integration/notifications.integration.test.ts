import { HttpStatusCode } from "axios";
import { api, generateTestUser } from "./setup";

describe("Successful Notification Scenarios", () => {
  it("should send notifications to both channels when both enabled", async () => {
    const testUser = generateTestUser("both");
    const { data: user } = await api.post("/api/users", testUser);

    const response = await api.post("/api/notification", {
      userId: user.userId,
      message: "Test notification to both channels",
    });

    expect(response.status).toBe(HttpStatusCode.Accepted);
    expect(response.data.message).toBe("Notifications queued");
  });

  it("should send notification only via email when SMS disabled", async () => {
    const testUser = generateTestUser("email");
    testUser.preferences.sms = false;
    const { data: user } = await api.put("/api/users", testUser);

    const response = await api.post("/api/notification", {
      userId: user.userId,
      message: "Test email-only notification",
    });

    expect(response.status).toBe(HttpStatusCode.Accepted);
    expect(response.data.message).toBe("Notifications queued");
  });

  it("should send notification only via SMS when email disabled", async () => {
    const testUser = generateTestUser("sms");
    testUser.preferences.email = false;
    const { data: user } = await api.put("/api/users", testUser);

    const response = await api.post("/api/notification", {
      userId: user.userId,
      message: "Test SMS-only notification",
    });

    expect(response.status).toBe(HttpStatusCode.Accepted);
    expect(response.data.message).toBe("Notifications queued");
  });

  it("should find and notify user by email instead of userId", async () => {
    const testUser = generateTestUser("email-search");
    const { data: user } = await api.post("/api/users", testUser);

    const response = await api.post("/api/notification", {
      email: user.email,
      message: "Test notification by email search",
    });

    expect(response.status).toBe(HttpStatusCode.Accepted);
    expect(response.data.message).toBe("Notifications queued");
  });
});
