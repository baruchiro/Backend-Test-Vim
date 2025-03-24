import cors from "cors";
import express from "express";
import { authenticate } from "./middlewares/authentication";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authenticate);

app.post("/api/notifications", (req, res) => {
  res.status(500).json({ message: "Not implemented" });
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
