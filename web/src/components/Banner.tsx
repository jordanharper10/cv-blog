export default function Banner({ kind='error', children }:{ kind?:'error'|'info'|'success'; children: any }) {
  const color = kind === 'error' ? 'bg-red-50 text-red-700 border-red-200'
              : kind === 'success' ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-blue-50 text-blue-700 border-blue-200';
  return <div className={`border rounded-xl px-3 py-2 text-sm ${color}`}>{children}</div>;
}

