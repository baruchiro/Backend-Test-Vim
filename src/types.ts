import { User } from "./services/types";

export interface SendNotificationRequest {
  userId?: number;
  email?: string;
  telephone?: string;
  message: string;
}

export interface CreateUserRequest extends Omit<User, "userId"> {}
