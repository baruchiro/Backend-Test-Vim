import { beforeEach, describe, expect, test } from "@jest/globals";
import db from "./db";
import { User } from "./types";

const dummyUsers = [
  {
    email: "ironman@avengers.com",
    telephone: "+123456789",
    preferences: { email: true, sms: true },
  },
  {
    email: "loki@avengers.com",
    telephone: "+123456788",
    preferences: { email: true, sms: false },
  },
  {
    email: "hulk@avengers.com",
    telephone: "+123456787",
    preferences: { email: false, sms: false },
  },
  {
    email: "blackwidow@avengers.com",
    telephone: "+123456786",
    preferences: { email: true, sms: true },
  },
] as const;

const reloadDbModule = () => {
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  });

  jest.resetModules();

  const freshDb = require("./db").default;
  Object.assign(db, freshDb);
};

describe("DB Module", () => {
  describe("users", () => {
    beforeEach(() => {
      reloadDbModule();
      dummyUsers.forEach(db.users.create);
    });

    describe(db.users.getOne.name, () => {
      describe("Basic search functionality", () => {
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
          expect(db.users.getOne({ userId: 999 })).toBeNull();
          expect(db.users.getOne({ email: "not@exists.com" })).toBeNull();
          expect(db.users.getOne({ telephone: "+999999999" })).toBeNull();
        });
      });

      describe("Search priority order", () => {
        test("should find by userId when multiple fields are provided", () => {
          const user = db.users.getOne({
            userId: 1,
            email: "loki@avengers.com", // belongs to userId 2
            telephone: "+123456787", // belongs to userId 3
          });
          expect(user?.userId).toBe(1);
          expect(user?.email).toBe("ironman@avengers.com");
        });

        test("should find by email when userId not found and telephone provided", () => {
          const user = db.users.getOne({
            userId: 999, // doesn't exist
            email: "loki@avengers.com",
            telephone: "+123456787", // belongs to userId 3
          });
          expect(user?.userId).toBe(2); // Loki's userId
        });

        test("should find by telephone when userId and email not found", () => {
          const user = db.users.getOne({
            userId: 999, // doesn't exist
            email: "not@exists.com", // doesn't exist
            telephone: "+123456787",
          });
          expect(user?.userId).toBe(3); // Hulk's userId
        });
      });

      describe("Edge cases", () => {
        test("should handle empty search object", () => {
          expect(db.users.getOne({})).toBeNull();
        });

        test("should ignore undefined and null values", () => {
          const user = db.users.getOne({
            userId: undefined,
            email: undefined,
            telephone: "+123456786", // belongs to userId 4
          });
          expect(user?.userId).toBe(4);
        });

        test("should handle invalid types gracefully", () => {
          expect(db.users.getOne({ userId: "not-a-number" as any })).toBeNull();
        });
      });
    });

    describe(db.users.create.name, () => {
      const validUser: Omit<User, "userId"> = {
        email: "thor@avengers.com",
        telephone: "+123456777",
        preferences: { email: true, sms: true },
      };

      test("should create user with all fields", () => {
        const user = db.users.create(validUser);
        expect(user.userId).toBeDefined();
        expect(user.email).toBe(validUser.email);
        expect(user.telephone).toBe(validUser.telephone);
        expect(user.preferences).toEqual(validUser.preferences);
      });

      test("should create user with minimal required fields", () => {
        const minimalUser: Omit<User, "userId"> = {
          email: undefined,
          telephone: undefined,
          preferences: { email: false, sms: false },
        };
        const user = db.users.create(minimalUser);
        expect(user.userId).toBeDefined();
        expect(user.email).toBeUndefined();
        expect(user.telephone).toBeUndefined();
        expect(user.preferences).toEqual(minimalUser.preferences);
      });

      test("should throw when email already exists", () => {
        db.users.create(validUser);
        expect(() =>
          db.users.create({
            ...validUser,
            telephone: "+123456666",
          })
        ).toThrow("Email already exists");
      });

      test("should throw when telephone already exists", () => {
        db.users.create(validUser);
        expect(() =>
          db.users.create({
            ...validUser,
            email: "newthor@avengers.com",
          })
        ).toThrow("Telephone already exists");
      });

      test("should throw when email preference is true but no email provided", () => {
        expect(() =>
          db.users.create({
            email: undefined,
            telephone: "+123456666",
            preferences: { email: true, sms: false },
          })
        ).toThrow("Email is required if email preference is true");
      });

      test("should throw when sms preference is true but no telephone provided", () => {
        expect(() =>
          db.users.create({
            email: "thor@avengers.com",
            telephone: undefined,
            preferences: { email: false, sms: true },
          })
        ).toThrow("Telephone is required if sms preference is true");
      });

      test("should auto-increment user ID", () => {
        const user1 = db.users.create({
          email: "thor1@avengers.com",
          telephone: "+123456661",
          preferences: { email: true, sms: true },
        });

        const user2 = db.users.create({
          email: "thor2@avengers.com",
          telephone: "+123456662",
          preferences: { email: true, sms: true },
        });

        expect(user2.userId).toBe(user1.userId + 1);
      });
    });

    describe(db.users.upsert.name, () => {
      const baseUser: Omit<User, "userId"> = {
        email: "thor@avengers.com",
        telephone: "+123456777",
        preferences: { email: true, sms: true },
      };

      test("should update existing user by userId", () => {
        const user = db.users.create(baseUser);
        const updatedUser = db.users.upsert({
          ...user,
          email: "newthor@avengers.com",
          preferences: { email: false, sms: true },
        });

        expect(updatedUser.userId).toBe(user.userId);
        expect(updatedUser.email).toBe("newthor@avengers.com");
        expect(updatedUser.preferences.email).toBe(false);
      });

      test("should update existing user by email", () => {
        const user = db.users.create(baseUser);
        const updatedUser = db.users.upsert({
          email: user.email,
          telephone: "+123456666",
          preferences: { email: true, sms: true },
        });

        expect(updatedUser.userId).toBe(user.userId);
        expect(updatedUser.telephone).toBe("+123456666");
      });

      test("should update existing user by telephone", () => {
        const user = db.users.create(baseUser);
        const updatedUser = db.users.upsert({
          telephone: user.telephone,
          email: "newthor@avengers.com",
          preferences: { email: true, sms: true },
        });

        expect(updatedUser.userId).toBe(user.userId);
        expect(updatedUser.email).toBe("newthor@avengers.com");
      });

      test("should create new user when no match found", () => {
        const newUser = db.users.upsert({
          email: "newuser@avengers.com",
          telephone: "+123456666",
          preferences: { email: true, sms: true },
        });

        expect(newUser.userId).toBeDefined();
        expect(newUser.email).toBe("newuser@avengers.com");
        expect(newUser.telephone).toBe("+123456666");
      });

      test("should throw when no identifier provided", () => {
        expect(() =>
          db.users.upsert({
            preferences: { email: false, sms: false },
          })
        ).toThrow("User must have either userId, email, or telephone");
      });

      test("should update user preferences", () => {
        const user = db.users.create(baseUser);
        const updatedUser = db.users.upsert({
          userId: user.userId,
          preferences: { email: false, sms: false },
        });

        expect(updatedUser.preferences.email).toBe(false);
        expect(updatedUser.preferences.sms).toBe(false);
      });

      test("should allow removing optional fields", () => {
        const user = db.users.create(baseUser);
        const updatedUser = db.users.upsert({
          userId: user.userId,
          email: undefined,
          telephone: undefined,
          preferences: { email: false, sms: false },
        });

        expect(updatedUser.email).toBeUndefined();
        expect(updatedUser.telephone).toBeUndefined();
      });
    });
  });
});
