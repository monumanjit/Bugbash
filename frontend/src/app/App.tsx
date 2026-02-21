import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DynamicQcForm } from '../components/forms/DynamicQcForm';
import { Role } from '../types';

const roles: Role[] = ['Admin', 'QC', 'Maintenance', 'Supervisor', 'Staff'];

export function App() {
  const [role, setRole] = useState<Role>('Admin');

  return (
    <AppLayout>
      <div className="toolbar">
        <label>
          Active Role
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <DashboardPage role={role} />
      <DynamicQcForm />
    </AppLayout>
  );
}
