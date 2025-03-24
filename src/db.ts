import { User } from "./types";

const userPreferences: User[] = [
  {
    userId: 1,
    email: "ironman@avengers.com",
    telephone: "+123456789",
    preferences: { email: true, sms: true },
  },
  {
    userId: 2,
    email: "loki@avengers.com",
    telephone: "+123456788",
    preferences: { email: true, sms: false },
  },
  {
    userId: 3,
    email: "hulk@avengers.com",
    telephone: "+123456787",
    preferences: { email: false, sms: false },
  },
  {
    userId: 4,
    email: "blackwidow@avengers.com",
    telephone: "+123456786",
    preferences: { email: true, sms: true },
  },
];

export default {
  users: {
    getOne: (filterBy: Partial<Omit<User, "preferences">>) => {
      const users = userPreferences.filter((user) => {
        return Object.entries(filterBy)
          .filter(([, value]) => !!value)
          .every(([key, value]) => {
            return user[key as keyof User] === value;
          });
      });

      if (users.length === 0) {
        return null;
      }

      if (users.length > 1) {
        throw new Error("Multiple users found");
      }

      return users[0];
    },
  },
};
