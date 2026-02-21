import { Router } from "express";
import { db } from "../../db/pool.js";
import { AuthedRequest } from "../../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/admin", async (req: AuthedRequest, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const [factories, users, failedBatches, overdue] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM factory WHERE organization_id=$1", [orgId]),
      db.query("SELECT COUNT(*)::int AS count FROM app_user WHERE organization_id=$1", [orgId]),
      db.query(
        `SELECT COUNT(*)::int AS count
         FROM raw_material_batch rmb
         JOIN raw_material rm ON rm.id=rmb.raw_material_id
         JOIN factory f ON f.id=rm.factory_id
         WHERE f.organization_id=$1 AND rmb.status='Rejected'`,
        [orgId]
      ),
      db.query(
        `SELECT COUNT(*)::int AS count
         FROM maintenance_schedule ms
         JOIN machine m ON m.id=ms.machine_id
         JOIN factory f ON f.id=m.factory_id
         WHERE f.organization_id=$1 AND ms.next_due_date < NOW()`,
        [orgId]
      )
    ]);

    return res.json({
      totalFactories: factories.rows[0].count,
      totalUsers: users.rows[0].count,
      totalFailedBatches: failedBatches.rows[0].count,
      overdueMaintenanceCount: overdue.rows[0].count
    });
  } catch (error) {
    return next(error);
  }
});
