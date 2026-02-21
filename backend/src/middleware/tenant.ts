import { NextFunction, Response } from "express";
import { AuthedRequest } from "./auth.js";

export function enforceTenant(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orgIdHeader = req.headers["x-organization-id"] as string | undefined;
  const factoryIdHeader = req.headers["x-factory-id"] as string | undefined;

  if (orgIdHeader && orgIdHeader !== req.user.organizationId) {
    return res.status(403).json({ message: "Invalid organization scope" });
  }

  if (factoryIdHeader && req.user.factoryId && factoryIdHeader !== req.user.factoryId && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Invalid factory scope" });
  }

  return next();
}
