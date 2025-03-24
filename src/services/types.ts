export interface NotificationResponse {
  status: "sent";
  channel: "email" | "sms";
  to: string;
  message: string;
}

export interface NotificationError {
  error: string;
}
