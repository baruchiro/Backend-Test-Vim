export interface NotificationResponse {
  status: "sent";
  channel: "email" | "sms";
  to: string;
  message: string;
}

export interface NotificationError {
  error: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

export interface User {
  userId: number;
  email?: string;
  telephone?: string;
  preferences: NotificationPreferences;
}
