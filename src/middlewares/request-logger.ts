import { NextFunction, Request, Response } from "express";
import logger from "../services/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    logger.info("Request processed", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ...(Object.keys(req.body).length > 0 && { body: req.body }),
    });
  });

  next();
};
