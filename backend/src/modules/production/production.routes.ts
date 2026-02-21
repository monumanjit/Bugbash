import { Router } from "express";
import { z } from "zod";
import { db } from "../../db/pool.js";
import { sendEmail, sendWhatsapp } from "../notifications/notification.service.js";

const createBatchSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string(),
  quantity: z.number().positive(),
  machineId: z.string().uuid()
});

const testSchema = z.object({
  productionBatchId: z.string().uuid(),
  tests: z.array(
    z.object({
      parameterName: z.string(),
      minValue: z.number(),
      maxValue: z.number(),
      actualValue: z.number()
    })
  )
});

export const productionRouter = Router();

productionRouter.post("/batches", async (req, res, next) => {
  try {
    const input = createBatchSchema.parse(req.body);
    const result = await db.query(
      `INSERT INTO production_batch (product_id, batch_number, quantity, machine_id, status, created_at)
       VALUES ($1,$2,$3,$4,'In QC',NOW()) RETURNING *`,
      [input.productId, input.batchNumber, input.quantity, input.machineId]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

productionRouter.post("/tests", async (req, res, next) => {
  try {
    const input = testSchema.parse(req.body);
    let failed = false;

    for (const test of input.tests) {
      const result = test.actualValue >= test.minValue && test.actualValue <= test.maxValue ? "Pass" : "Fail";
      if (result === "Fail") failed = true;
      await db.query(
        `INSERT INTO finished_product_test
          (production_batch_id, parameter_name, min_value, max_value, actual_value, result)
          VALUES ($1,$2,$3,$4,$5,$6)`,
        [input.productionBatchId, test.parameterName, test.minValue, test.maxValue, test.actualValue, result]
      );
    }

    const batchStatus = failed ? "Rejected" : "Approved";
    await db.query("UPDATE production_batch SET status=$1 WHERE id=$2", [batchStatus, input.productionBatchId]);

    if (failed) {
      const users = await db.query(
        `SELECT u.id, u.email, u.phone
         FROM app_user u
         JOIN production_batch pb ON pb.id=$1
         JOIN product p ON p.id=pb.product_id
         WHERE u.factory_id=p.factory_id AND u.role IN ('Admin','Supervisor')`,
        [input.productionBatchId]
      );
      await Promise.all(
        users.rows.map(async (user) => {
          const message = `Production batch ${input.productionBatchId} failed QC and is now locked.`;
          await sendEmail(user.id, user.email, "RAMBA Finished Product Failure", message);
          if (user.phone) await sendWhatsapp(user.id, user.phone, message);
        })
      );
    }

    return res.json({ productionBatchId: input.productionBatchId, status: batchStatus });
  } catch (error) {
    return next(error);
  }
});
