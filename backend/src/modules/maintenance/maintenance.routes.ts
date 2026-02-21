import { Router } from "express";
import { z } from "zod";
import { db } from "../../db/pool.js";

export const maintenanceRouter = Router();

const logSchema = z.object({
  machineId: z.string().uuid(),
  maintenanceType: z.string(),
  performedBy: z.string().uuid(),
  notes: z.string().optional()
});

maintenanceRouter.post("/logs", async (req, res, next) => {
  try {
    const input = logSchema.parse(req.body);
    const result = await db.query(
      `INSERT INTO maintenance_log (machine_id, maintenance_type, performed_by, notes, performed_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [input.machineId, input.maintenanceType, input.performedBy, input.notes ?? null]
    );

    await db.query(
      `UPDATE maintenance_schedule
       SET next_due_date = NOW() + (frequency_days || ' days')::interval
       WHERE machine_id=$1`,
      [input.machineId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

maintenanceRouter.get("/overdue", async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT ms.*, m.name AS machine_name
       FROM maintenance_schedule ms
       JOIN machine m ON ms.machine_id=m.id
       WHERE ms.next_due_date < NOW()`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});
