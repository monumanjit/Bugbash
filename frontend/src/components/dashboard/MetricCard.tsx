export function MetricCard({ title, value, tone = 'neutral' }: { title: string; value: string | number; tone?: 'neutral' | 'good' | 'bad' }) {
  return (
    <article className={`metric metric-${tone}`}>
      <p>{title}</p>
      <h3>{value}</h3>
    </article>
  );
}
