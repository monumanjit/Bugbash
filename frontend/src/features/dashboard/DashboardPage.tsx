import { Role } from '../../types';
import { MetricCard } from '../../components/dashboard/MetricCard';

const roleWidgets: Record<Role, { title: string; value: string; tone?: 'neutral' | 'good' | 'bad' }[]> = {
  Admin: [
    { title: 'Total Factories', value: '12' },
    { title: 'Total Users', value: '146' },
    { title: 'Total Failed Batches', value: '9', tone: 'bad' },
    { title: 'Overdue Maintenance Count', value: '4', tone: 'bad' }
  ],
  QC: [
    { title: 'Pending Tests', value: '15' },
    { title: 'Failed Tests', value: '3', tone: 'bad' },
    { title: 'Recently Approved Batches', value: '22', tone: 'good' }
  ],
  Maintenance: [
    { title: 'Overdue Machines', value: '4', tone: 'bad' },
    { title: 'Upcoming PM', value: '7' },
    { title: 'Maintenance History', value: '128' }
  ],
  Supervisor: [
    { title: "Today's Production", value: '6' },
    { title: 'QC Pass Rate %', value: '92%', tone: 'good' },
    { title: 'Pending Tasks', value: '11' }
  ],
  Staff: [
    { title: 'Assigned Tasks', value: '5' },
    { title: 'Completed Today', value: '3', tone: 'good' },
    { title: 'Due Today', value: '2' }
  ]
};

export function DashboardPage({ role }: { role: Role }) {
  return (
    <section>
      <h1>{role} Dashboard</h1>
      <div className="grid">
        {roleWidgets[role].map((widget) => (
          <MetricCard key={widget.title} {...widget} />
        ))}
      </div>
    </section>
  );
}
