import { NextFunction, Request, Response } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  return res.status(500).json({
    message: "Unexpected error",
    detail: process.env.NODE_ENV === "production" ? undefined : err.message
  });
}
