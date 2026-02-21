import { Router } from "express";
import { z } from "zod";
import { db } from "../../db/pool.js";
import { AuthedRequest } from "../../middleware/auth.js";
import { sendEmail, sendWhatsapp } from "../notifications/notification.service.js";
import { createAuditLog } from "../audit/audit.service.js";

const createBatchSchema = z.object({
  rawMaterialId: z.string().uuid(),
  supplierId: z.string().uuid(),
  batchNumber: z.string(),
  receivedQuantity: z.number().positive()
});

const testSchema = z.object({
  rawMaterialBatchId: z.string().uuid(),
  tests: z.array(
    z.object({
      parameterName: z.string(),
      minValue: z.number(),
      maxValue: z.number(),
      actualValue: z.number()
    })
  )
});

export const rawMaterialRouter = Router();

rawMaterialRouter.post("/batches", async (req: AuthedRequest, res, next) => {
  try {
    const input = createBatchSchema.parse(req.body);
    const result = await db.query(
      `INSERT INTO raw_material_batch
      (raw_material_id, supplier_id, batch_number, received_quantity, status, created_at)
      VALUES ($1,$2,$3,$4,'Pending',NOW()) RETURNING *`,
      [input.rawMaterialId, input.supplierId, input.batchNumber, input.receivedQuantity]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

rawMaterialRouter.post("/tests", async (req: AuthedRequest, res, next) => {
  try {
    const input = testSchema.parse(req.body);
    let hasFail = false;

    for (const test of input.tests) {
      const result = test.actualValue >= test.minValue && test.actualValue <= test.maxValue ? "Pass" : "Fail";
      if (result === "Fail") hasFail = true;
      await db.query(
        `INSERT INTO raw_material_test
        (raw_material_batch_id, parameter_name, min_value, max_value, actual_value, result)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [input.rawMaterialBatchId, test.parameterName, test.minValue, test.maxValue, test.actualValue, result]
      );
    }

    const status = hasFail ? "Rejected" : "Approved";
    await db.query("UPDATE raw_material_batch SET status=$1 WHERE id=$2", [status, input.rawMaterialBatchId]);

    if (hasFail && req.user) {
      const admins = await db.query(
        "SELECT id, email, phone FROM app_user WHERE organization_id=$1 AND role='Admin'",
        [req.user.organizationId]
      );
      await Promise.all(
        admins.rows.map(async (admin) => {
          const message = `Raw material batch ${input.rawMaterialBatchId} failed QC and is rejected.`;
          await sendEmail(admin.id, admin.email, "RAMBA QC Alert", message);
          if (admin.phone) await sendWhatsapp(admin.id, admin.phone, message);
        })
      );
    }

    if (req.user) {
      await createAuditLog({
        organizationId: req.user.organizationId,
        factoryId: req.user.factoryId,
        userId: req.user.id,
        action: "CREATE",
        entityType: "RawMaterialTest",
        entityId: input.rawMaterialBatchId,
        changes: input.tests
      });
    }

    return res.json({ rawMaterialBatchId: input.rawMaterialBatchId, status });
  } catch (error) {
    return next(error);
  }
});
