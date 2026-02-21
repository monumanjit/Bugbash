# RAMBA – Quality Management System

Production-ready multi-tenant SaaS foundation for paint & coating MSME manufacturers.

## Architecture
- **Frontend:** React + TypeScript + Vite (responsive desktop/tablet UI)
- **Backend:** Node.js + Express + TypeScript, REST API, JWT auth
- **Database:** PostgreSQL with multi-tenant hierarchy (`organization -> factory -> users`)
- **Storage:** S3-compatible file object storage (COA/images)
- **Notifications:** Twilio WhatsApp + SMTP/SendGrid email

## Backend code structure

```txt
backend/src
├── app.ts
├── server.ts
├── config/env.ts
├── db/pool.ts
├── middleware/
│   ├── auth.ts
│   ├── tenant.ts
│   └── error-handler.ts
├── modules/
│   ├── auth/auth.routes.ts
│   ├── raw-materials/raw-material.routes.ts
│   ├── production/production.routes.ts
│   ├── maintenance/maintenance.routes.ts
│   ├── tasks/task.routes.ts
│   ├── notifications/notification.service.ts
│   ├── reports/dashboard.routes.ts
│   ├── reports/report.routes.ts
│   └── audit/audit.service.ts
├── routes/index.ts
└── scheduler/maintenance.scheduler.ts
```

## API routes (phase 1)

- `POST /api/v1/auth/login`
- `POST /api/v1/raw-materials/batches`
- `POST /api/v1/raw-materials/tests`
- `POST /api/v1/production/batches`
- `POST /api/v1/production/tests`
- `POST /api/v1/maintenance/logs`
- `GET /api/v1/maintenance/overdue`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id/complete`
- `GET /api/v1/dashboard/admin`
- `GET /api/v1/reports/raw-material/:batchId` (PDF)
- `GET /api/v1/reports/finished-product/:batchId` (PDF)

## Business logic coverage
- Raw material QC auto pass/fail and batch rejection + admin alerts.
- Finished product QC auto pass/fail, failed batch lock + email/WhatsApp alerts.
- Daily maintenance overdue scheduler + notification alerts.
- Supervisor task assignment and staff completion timestamps.
- Role-based access middleware and tenant scope enforcement.
- Audit log service for change tracking.

## Database schema
Full normalized schema is in `backend/sql/schema.sql` including:
- Core entities from spec (Organization, Factory, User, Supplier, RawMaterial, Product, Machine, Task, NotificationLog)
- Testing tables (`raw_material_test`, `finished_product_test`)
- Maintenance tables (`maintenance_schedule`, `maintenance_log`)
- Audit table (`audit_log`)
- Indexes for tenant and workflow performance.

## Frontend folder structure

```txt
frontend/src
├── app/App.tsx
├── main.tsx
├── components/
│   ├── layout/AppLayout.tsx
│   ├── layout/Sidebar.tsx
│   ├── dashboard/MetricCard.tsx
│   └── forms/DynamicQcForm.tsx
├── features/dashboard/DashboardPage.tsx
├── styles/global.css
└── types/index.ts
```

## UI highlights
- Industrial sidebar nav with core modules.
- Role-driven dashboard widgets (Admin/QC/Maintenance/Supervisor/Staff).
- Dynamic QC parameter rows and COA/image file upload input.
- Pass/Fail visual indicators in green/red.

## Security controls
- JWT-based authentication
- Role-based route authorization
- Tenant enforcement middleware (`x-organization-id`, `x-factory-id`)
- Password hashing with bcrypt
- Input validation with Zod
- Audit log entries for entity edits

## Future-ready design hooks
- Extend `production_batch` and product movements for inventory deduction.
- Add billing/subscription tables linked to `organization`.
- Attach GST credit scoring pipelines to QC + supplier performance signals.

## Run locally

### 1) Infrastructure quick start
```bash
cd infra
docker compose up --build
```

### 2) Backend local dev
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3) Frontend local dev
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4) Apply DB schema
```bash
psql "$DATABASE_URL" -f backend/sql/schema.sql
```

## Deployment notes
- Build images using `backend/Dockerfile` and `frontend/Dockerfile`.
- Store secrets in cloud secret manager, not `.env` files.
- Configure managed PostgreSQL and S3 bucket lifecycle policies.
- Run scheduler as part of backend service replicas (leader lock recommended for multi-replica).
