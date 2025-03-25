import axios from "axios";

export const API_URL = "http://localhost:8080";
export const AUTH_TOKEN = "onlyvim2024";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
});

jest.setTimeout(10000);

export const generateTestUser = (prefix = "") => ({
  email: `test.${prefix}${Date.now()}@example.com`,
  telephone: `+1${Math.floor(Math.random() * 10000000000)}`,
  preferences: { email: true, sms: true },
});
