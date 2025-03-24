import { NextFunction, Request, Response } from "express";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader !== "Bearer onlyvim2024") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};
