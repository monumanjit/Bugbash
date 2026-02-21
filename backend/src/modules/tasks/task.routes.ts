import { Router } from "express";
import { z } from "zod";
import { db } from "../../db/pool.js";

export const taskRouter = Router();

const createTaskSchema = z.object({
  factoryId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  assignedBy: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  dueDate: z.string().datetime()
});

taskRouter.post("/", async (req, res, next) => {
  try {
    const input = createTaskSchema.parse(req.body);
    const result = await db.query(
      `INSERT INTO task
      (factory_id, assigned_to, assigned_by, title, description, status, due_date)
      VALUES ($1,$2,$3,$4,$5,'Open',$6) RETURNING *`,
      [input.factoryId, input.assignedTo, input.assignedBy, input.title, input.description, input.dueDate]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

taskRouter.patch("/:id/complete", async (req, res, next) => {
  try {
    const result = await db.query(
      "UPDATE task SET status='Completed', completed_at=NOW() WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});
