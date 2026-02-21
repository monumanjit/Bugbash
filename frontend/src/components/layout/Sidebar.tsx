const menu = ['Dashboard', 'Raw Materials', 'Production', 'QC', 'Machines', 'Maintenance', 'Tasks', 'Reports', 'Settings'];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>RAMBA QMS</h2>
      <ul>
        {menu.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
