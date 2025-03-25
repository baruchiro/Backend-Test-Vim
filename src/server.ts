import cors from "cors";
import express from "express";
import { authenticate } from "./middlewares/authentication";
import { requestLogger } from "./middlewares/request-logger";
import db from "./services/db";
import logger from "./services/logger";
import * as notificationsService from "./services/notifications";
import { CreateUserRequest, SendNotificationRequest } from "./types";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api", authenticate);

app.post<{}, {}, SendNotificationRequest>(
  "/api/notification",
  async (req, res) => {
    // TODO: can be async with MQ
    const { userId, email, telephone, message } = req.body;

    if (!message) {
      logger.error("Missing message in notification request", {
        userId,
        email,
        telephone,
      });
      res.status(400).json({ message: "Message is required" });
      return;
    }

    if (!userId && !email && !telephone) {
      logger.error("Missing user identifier in notification request");
      res
        .status(400)
        .json({ message: "User ID, email, or telephone is required" });
      return;
    }

    const user = db.users.getOne({ userId, email, telephone });

    if (!user) {
      logger.error("User not found for notification", {
        userId,
        email,
        telephone,
      });
      res.status(404).json({ message: "User not found" });
      return;
    }

    // TODO: what if both email and sms are false?
    // TODO: what if one of the notifications fails?
    try {
      if (user.preferences.email && user.email) {
        logger.info("Sending email notification", {
          userId: user.userId,
          email: user.email,
        });
        await notificationsService.sendEmail(user.email, message);
      }

      if (user.preferences.sms && user.telephone) {
        logger.info("Sending SMS notification", {
          userId: user.userId,
          telephone: user.telephone,
        });
        await notificationsService.sendSms(user.telephone, message);
      }

      if (!user.preferences.email && !user.preferences.sms) {
        logger.info("User has disabled all notifications", {
          userId: user.userId,
        });
      }
      res.status(200).json({ message: "Notifications sent" });
    } catch (error) {
      logger.error("Failed to send notifications", {
        userId: user.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ message: "Failed to send notifications" });
    }
  }
);

app.post<{}, {}, CreateUserRequest>("/api/users", (req, res) => {
  try {
    const user = db.users.create(req.body);
    logger.info("User created successfully", { userId: user.userId });
    res.status(201).json(user);
  } catch (error) {
    // TODO: handle everywhere
    // TODO: consider middleware
    logger.error("Failed to create user", {
      email: req.body.email,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(400).json({ message: (error as Error).message });
  }
});

app.put("/api/users", (req, res) => {
  try {
    const user = db.users.upsert(req.body);
    
    logger.info("User preferences updated", { userId: user.userId });
    res.status(200).json(user);
  } catch (error) {
    logger.error("Failed to update user preferences", {
      email: req.body.email,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(400).json({ message: (error as Error).message });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
