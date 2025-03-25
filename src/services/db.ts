import { User } from "./types";

const emailsToUsers: Record<string, User> = {};
const telephonesToUsers: Record<string, User> = {};
const idToUsers: Record<number, User> = {};
let lastUserId = 0;

const createUser = (user: Omit<User, "userId">) => {
  if (user.email && emailsToUsers[user.email]) {
    throw new Error("Email already exists");
  }
  if (user.telephone && telephonesToUsers[user.telephone]) {
    throw new Error("Telephone already exists");
  }

  if (user.preferences.email && !user.email) {
    throw new Error("Email is required if email preference is true");
  }

  if (user.preferences.sms && !user.telephone) {
    throw new Error("Telephone is required if sms preference is true");
  }

  const newUser = {
    ...user,
    userId: lastUserId + 1,
  };
  idToUsers[newUser.userId] = newUser;
  if (newUser.email) {
    emailsToUsers[newUser.email] = newUser;
  }
  if (newUser.telephone) {
    telephonesToUsers[newUser.telephone] = newUser;
  }
  lastUserId = newUser.userId;

  return newUser;
};

const upsertUser = (user: Partial<User>) => {
  if (!user.userId && !user.email && !user.telephone) {
    throw new Error("User must have either userId, email, or telephone");
  }

  // TODO: test if change in one index will affect others
  if (user.userId) {
    if (idToUsers[user.userId]) {
      return Object.assign(idToUsers[user.userId], user);
    }
    throw new Error("Cannot update user with userId that does not exist");
  }

  if (user.email && emailsToUsers[user.email]) {
    return Object.assign(emailsToUsers[user.email], user);
  }

  if (user.telephone && telephonesToUsers[user.telephone]) {
    return Object.assign(telephonesToUsers[user.telephone], user);
  }

  return createUser(user as Omit<User, "userId">);
};

const getUser = (filterBy: Partial<Omit<User, "preferences">>) => {
  if (filterBy.userId && idToUsers[filterBy.userId]) {
    return idToUsers[filterBy.userId];
  }

  if (filterBy.email && emailsToUsers[filterBy.email]) {
    return emailsToUsers[filterBy.email];
  }

  if (filterBy.telephone && telephonesToUsers[filterBy.telephone]) {
    return telephonesToUsers[filterBy.telephone];
  }

  return null;
};

export default {
  users: {
    create: createUser,
    upsert: upsertUser,
    getOne: getUser,
  },
};
