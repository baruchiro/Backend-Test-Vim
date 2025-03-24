import cors from "cors";
import express from "express";
import db from "./db";
import { authenticate } from "./middlewares/authentication";
import { SendNotificationRequest } from "./types";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authenticate);

app.post<{}, {}, SendNotificationRequest>("/api/notification", (req, res) => {
  const { userId, email, telephone, message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  if (!userId && !email && !telephone) {
    return res
      .status(400)
      .json({ message: "User ID, email, or telephone is required" });
  }

  const user = db.users.getOne({ userId, email, telephone });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
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
