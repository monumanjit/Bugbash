import { db } from "../../db/pool.js";

export async function createAuditLog(params: {
  organizationId: string;
  factoryId: string | null;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: unknown;
}) {
  await db.query(
    `INSERT INTO audit_log
      (organization_id, factory_id, user_id, action, entity_type, entity_id, changes, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
    [
      params.organizationId,
      params.factoryId,
      params.userId,
      params.action,
      params.entityType,
      params.entityId,
      JSON.stringify(params.changes)
    ]
  );
}
