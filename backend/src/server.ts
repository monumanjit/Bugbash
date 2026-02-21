import { app } from "./app.js";
import { env } from "./config/env.js";
import { startMaintenanceScheduler } from "./scheduler/maintenance.scheduler.js";

app.listen(env.port, () => {
  console.log(`RAMBA backend running on port ${env.port}`);
});

startMaintenanceScheduler();
