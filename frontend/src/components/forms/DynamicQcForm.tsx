import { useMemo, useState } from 'react';

interface Row {
  parameterName: string;
  minValue: number;
  maxValue: number;
  actualValue: number;
}

export function DynamicQcForm() {
  const [rows, setRows] = useState<Row[]>([{ parameterName: '', minValue: 0, maxValue: 0, actualValue: 0 }]);

  const result = useMemo(() => rows.every((r) => r.actualValue >= r.minValue && r.actualValue <= r.maxValue), [rows]);

  return (
    <section className="panel">
      <h2>QC Parameter Entry</h2>
      {rows.map((row, index) => (
        <div key={index} className="row">
          <input
            placeholder="Parameter"
            value={row.parameterName}
            onChange={(e) => {
              const next = [...rows];
              next[index].parameterName = e.target.value;
              setRows(next);
            }}
          />
          <input type="number" placeholder="Min" onChange={(e) => {
            const next = [...rows];
            next[index].minValue = Number(e.target.value);
            setRows(next);
          }} />
          <input type="number" placeholder="Max" onChange={(e) => {
            const next = [...rows];
            next[index].maxValue = Number(e.target.value);
            setRows(next);
          }} />
          <input type="number" placeholder="Actual" onChange={(e) => {
            const next = [...rows];
            next[index].actualValue = Number(e.target.value);
            setRows(next);
          }} />
        </div>
      ))}
      <button onClick={() => setRows([...rows, { parameterName: '', minValue: 0, maxValue: 0, actualValue: 0 }])}>Add Parameter</button>
      <label className="upload">Upload COA/Image <input type="file" /></label>
      <p className={result ? 'pass' : 'fail'}>{result ? 'Pass' : 'Fail'}</p>
    </section>
  );
}
