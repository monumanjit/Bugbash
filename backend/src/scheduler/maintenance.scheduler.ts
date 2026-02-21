import cron from "node-cron";
import { db } from "../db/pool.js";
import { sendEmail, sendWhatsapp } from "../modules/notifications/notification.service.js";

export function startMaintenanceScheduler() {
  cron.schedule("0 7 * * *", async () => {
    const overdue = await db.query(
      `SELECT ms.id, m.name AS machine_name, f.id AS factory_id
       FROM maintenance_schedule ms
       JOIN machine m ON m.id=ms.machine_id
       JOIN factory f ON f.id=m.factory_id
       WHERE ms.next_due_date < NOW()`
    );

    for (const item of overdue.rows) {
      const users = await db.query("SELECT id, email, phone FROM app_user WHERE factory_id=$1 AND role IN ('Admin','Maintenance')", [
        item.factory_id
      ]);
      await Promise.all(
        users.rows.map(async (user) => {
          const message = `Maintenance overdue for machine ${item.machine_name}`;
          await sendEmail(user.id, user.email, "RAMBA Maintenance Alert", message);
          if (user.phone) await sendWhatsapp(user.id, user.phone, message);
        })
      );
    }
  });
}
