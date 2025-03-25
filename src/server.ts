import cors from "cors";
import express from "express";
import { authenticate } from "./middlewares/authentication";
import db from "./services/db";
import * as notificationsService from "./services/notifications";
import { CreateUserRequest, SendNotificationRequest } from "./types";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authenticate);

app.post<{}, {}, SendNotificationRequest>(
  "/api/notification",
  async (req, res) => {
    // TODO: can be async with MQ
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
      // TODO: validate preference.email and user.email mutually exclusive
      await notificationsService.sendEmail(user.email, message);
    }

    if (user.preferences.sms) {
      // TODO: validate preference.sms and user.telephone mutually exclusive
      await notificationsService.sendSms(user.telephone, message);
    }

    res.status(200).json({ message: "Notifications sent" });
  }
);

app.post<{}, {}, CreateUserRequest>("/api/users", (req, res) => {
  try {
    const user = db.users.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    // TODO: handle everywhere
    // TODO: consider middleware
    res.status(400).json({ message: (error as Error).message });
  }
});

app.put("/api/users", (req, res) => {
  const user = db.users.upsert(req.body);
  res.status(200).json(user);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
