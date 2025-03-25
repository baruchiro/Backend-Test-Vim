import cors from "cors";
import express from "express";
import { authenticate } from "./middlewares/authentication";
import { requestLogger } from "./middlewares/request-logger";
import db from "./services/db";
import logger from "./services/logger";
import * as notificationsService from "./services/notifications";
import { InMemoryQueue, NotificationMessage } from "./services/queue";
import { CreateUserRequest, SendNotificationRequest } from "./types";
import { HttpStatusCode } from "axios";

const app = express();

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS);
const emailRateLimit = Number(process.env.EMAIL_RATE_LIMIT);
const smsRateLimit = Number(process.env.SMS_RATE_LIMIT);

const emailQueue = new InMemoryQueue(emailRateLimit, rateLimitWindowMs);
const smsQueue = new InMemoryQueue(smsRateLimit, rateLimitWindowMs);

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api", authenticate);

const handleNotification = async (
  message: NotificationMessage,
  ack: () => void
) => {
  try {
    if (message.type === "email") {
      await notificationsService.sendEmail(message.recipient, message.message);
    } else {
      await notificationsService.sendSms(message.recipient, message.message);
    }
    ack();
  } catch (error) {
    if (message.attempts >= 3) {
      logger.error("Dropping message after max retries", {
        userId: message.userId,
        type: message.type,
        attempts: message.attempts,
        error: error instanceof Error ? error.message : String(error),
      });
      ack();
    } else {
      const queue = message.type === "email" ? emailQueue : smsQueue;
      queue.send({
        ...message,
        attempts: message.attempts + 1,
      });
      ack();
    }
  }
};

emailQueue.listen(handleNotification);
smsQueue.listen(handleNotification);

app.post<{}, {}, SendNotificationRequest>(
  "/api/notification",
  async (req, res) => {
    const { userId, email, telephone, message } = req.body;

    if (!message) {
      logger.error("Missing message in notification request", {
        userId,
        email,
        telephone,
      });
      res.status(HttpStatusCode.BadRequest).json({ message: "Message is required" });
      return;
    }

    if (!userId && !email && !telephone) {
      logger.error("Missing user identifier in notification request");
      res
        .status(HttpStatusCode.BadRequest)
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
      res.status(HttpStatusCode.NotFound).json({ message: "User not found" });
      return;
    }

    if (user.preferences.email && user.email) {
      emailQueue.send({
        type: "email",
        recipient: user.email,
        message,
        userId: user.userId,
        attempts: 0,
      });
    }

    if (user.preferences.sms && user.telephone) {
      smsQueue.send({
        type: "sms",
        recipient: user.telephone,
        message,
        userId: user.userId,
        attempts: 0,
      });
    }

    if (!user.preferences.email && !user.preferences.sms) {
      logger.info("User has disabled all notifications", {
        userId: user.userId,
      });
    }

    res.status(HttpStatusCode.Accepted).json({ message: "Notifications queued" });
  }
);

app.post<{}, {}, CreateUserRequest>("/api/users", (req, res) => {
  try {
    const user = db.users.create(req.body);
    logger.info("User created successfully", { userId: user.userId });
    res.status(HttpStatusCode.Created).json(user);
  } catch (error) {
    logger.error("Failed to create user", {
      email: req.body.email,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(HttpStatusCode.BadRequest).json({ message: (error as Error).message });
  }
});

app.put("/api/users", (req, res) => {
  try {
    const user = db.users.upsert(req.body);
    
    logger.info("User preferences updated", { userId: user.userId });
    res.status(HttpStatusCode.Ok).json(user);
  } catch (error) {
    logger.error("Failed to update user preferences", {
      email: req.body.email,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(HttpStatusCode.BadRequest).json({ message: (error as Error).message });
  }
});

app.get("/health", (req, res) => {
  res.status(HttpStatusCode.Ok).json({ status: "OK" });
});

export default app;
