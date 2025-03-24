import { describe, expect, test } from "@jest/globals";
import db from "./db";

describe("DB Module", () => {
  describe("users", () => {
    // TODO: after implementing user add, rewrite the tests:
    // - test that getOne returns null when no user is found
    // - test that getOne throws an error when multiple users are found
    // - test find user by more than one field
    // - test ignored empty search fields
    describe(db.users.getOne.name, () => {
      test("should find a user by userId", () => {
        const user = db.users.getOne({ userId: 1 });
        expect(user).not.toBeNull();
        expect(user?.userId).toBe(1);
        expect(user?.email).toBe("ironman@avengers.com");
      });

      test("should find a user by email", () => {
        const user = db.users.getOne({ email: "loki@avengers.com" });
        expect(user).not.toBeNull();
        expect(user?.userId).toBe(2);
        expect(user?.telephone).toBe("+123456788");
      });

      test("should find a user by telephone", () => {
        const user = db.users.getOne({ telephone: "+123456787" });
        expect(user).not.toBeNull();
        expect(user?.userId).toBe(3);
        expect(user?.email).toBe("hulk@avengers.com");
      });

      test("should return null when no user is found", () => {
        const user = db.users.getOne({ userId: 999 });
        expect(user).toBeNull();
      });

      test.skip("should throw error when multiple users are found", () => {});
    });
  });
});
