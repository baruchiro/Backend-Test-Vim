export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

export interface User {
  userId: number;
  email: string;
  telephone: string;
  preferences: NotificationPreferences;
}

export interface SendNotificationRequest {
  userId?: number;
  email?: string;
  telephone?: string;
  message: string;
}
