import cors from "cors";
import express from "express";
import db from "./db";
import { authenticate } from "./middlewares/authentication";
import * as notificationsService from "./services/notifications";
import { SendNotificationRequest } from "./types";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authenticate);

app.post<{}, {}, SendNotificationRequest>("/api/notification", (req, res) => {
  const { userId, email, telephone, message } = req.body;

  if (!message) {
    res.status(400).json({ message: "Message is required" });
    return;
  }

  if (!userId && !email && !telephone) {
    res
      .status(400)
      .json({ message: "User ID, email, or telephone is required" });
    return;
  }

  const user = db.users.getOne({ userId, email, telephone });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // TODO: what if both email and sms are false?
  // TODO: what if one of the notifications fails?
  if (user.preferences.email) {
    notificationsService.sendEmail(user.email, message);
  }

  if (user.preferences.sms) {
    notificationsService.sendSms(user.telephone, message);
  }

  res.status(200).json({ message: "Notifications sent" });
});

app.put("/api/users/preferences", (req, res) => {
  res.status(500).json({ message: "Not implemented" });
});

app.post("/api/users", (req, res) => {
  res.status(500).json({ message: "Not implemented" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
