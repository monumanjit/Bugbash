import { Router } from "express";
import PDFDocument from "pdfkit";
import { db } from "../../db/pool.js";

export const reportRouter = Router();

async function buildPdf(title: string, rows: unknown[]) {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk as Buffer));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).text(title);
  doc.moveDown();
  doc.fontSize(10).text(JSON.stringify(rows, null, 2));
  doc.end();

  return done;
}

reportRouter.get("/raw-material/:batchId", async (req, res, next) => {
  try {
    const tests = await db.query("SELECT * FROM raw_material_test WHERE raw_material_batch_id=$1", [req.params.batchId]);
    const buffer = await buildPdf(`Raw Material Test Report - ${req.params.batchId}`, tests.rows);
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

reportRouter.get("/finished-product/:batchId", async (req, res, next) => {
  try {
    const tests = await db.query("SELECT * FROM finished_product_test WHERE production_batch_id=$1", [req.params.batchId]);
    const buffer = await buildPdf(`Finished Product COA - ${req.params.batchId}`, tests.rows);
    res.setHeader("Content-Type", "application/pdf");
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});
