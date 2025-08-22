import { useMemo } from 'react';

export default function CrudTable({ rows, columns, onEdit, onDelete }:{
  rows:any[];
  columns:{ key:string; label:string; render?:(v:any,row:any)=>any }[];
  onEdit:(row:any)=>void;
  onDelete:(row:any)=>void;
}){
  const cols = useMemo(()=>columns,[columns]);
  return (
    <div className="overflow-x-auto border rounded-2xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {cols.map(c => <th key={c.key} className="text-left px-3 py-2 font-medium">{c.label}</th>)}
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t">
              {cols.map(c => (
                <td key={c.key} className="px-3 py-2 align-top">{c.render ? c.render(r[c.key], r) : r[c.key]}</td>
              ))}
              <td className="px-3 py-2 text-right">
                <button className="px-2 py-1 mr-2 rounded-lg border" onClick={()=>onEdit(r)}>Edit</button>
                <button className="px-2 py-1 rounded-lg border" onClick={()=>onDelete(r)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
