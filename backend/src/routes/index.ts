import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { rawMaterialRouter } from "../modules/raw-materials/raw-material.routes.js";
import { productionRouter } from "../modules/production/production.routes.js";
import { maintenanceRouter } from "../modules/maintenance/maintenance.routes.js";
import { taskRouter } from "../modules/tasks/task.routes.js";
import { dashboardRouter } from "../modules/reports/dashboard.routes.js";
import { reportRouter } from "../modules/reports/report.routes.js";
import { requireAuth } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok" }));
apiRouter.use("/auth", authRouter);
apiRouter.use(requireAuth, enforceTenant);
apiRouter.use("/raw-materials", rawMaterialRouter);
apiRouter.use("/production", productionRouter);
apiRouter.use("/maintenance", maintenanceRouter);
apiRouter.use("/tasks", taskRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/reports", reportRouter);
