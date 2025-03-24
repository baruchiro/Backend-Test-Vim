import axios from "axios";
import { NotificationResponse } from "./types";

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;

if (!NOTIFICATION_SERVICE_URL) {
  throw new Error("NOTIFICATION_SERVICE_URL is not set");
}

export const sendEmail = async (email: string, message: string) => {
  const response = await axios.post<NotificationResponse>(
    `${NOTIFICATION_SERVICE_URL}/send-email`,
    {
      email,
      message,
    }
  );

  return response.data;
};

export const sendSms = async (telephone: string, message: string) => {
  const response = await axios.post<NotificationResponse>(
    `${NOTIFICATION_SERVICE_URL}/send-sms`,
    {
      telephone,
      message,
    }
  );

  return response.data;
};
