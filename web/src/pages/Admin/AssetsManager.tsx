import { useEffect, useState } from 'react';
import { deleteUpload, listUploads } from '../../api';
import UploadButton from '../../components/UploadButton';

export default function AssetsManager(){
  const [rows,setRows] = useState<any[]>([]);
  const [msg,setMsg] = useState('');
  const load = async () => setRows(await listUploads());
  useEffect(()=>{ load(); },[]);

  async function onDelete(name:string){
    if(!confirm('Delete this file?')) return;
    await deleteUpload(name);
    setMsg('Deleted.'); setTimeout(()=>setMsg(''), 800);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Assets</h1>
      <UploadButton label="Upload file" onUploaded={()=>load()} />
      {msg && <div className="text-sm text-green-700">{msg}</div>}
      <div className="grid md:grid-cols-3 gap-3">
        {rows.map(f => (
          <div key={f.name} className="border rounded-2xl p-3 flex gap-3 items-center">
            {/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.name)
              ? <img src={f.url} className="h-12 w-12 object-cover rounded-lg" />
              : <div className="h-12 w-12 rounded-lg border flex items-center justify-center text-xs">file</div>}
            <div className="text-sm break-all flex-1">
              <div className="font-mono">{f.name}</div>
              <div className="text-gray-500">{Math.round(f.size/1024)} KB</div>
              <div className="text-gray-500">{new Date(f.mtime).toLocaleString()}</div>
              <button
                className="mt-1 text-xs underline"
                onClick={() => navigator.clipboard.writeText(f.url)}
              >Copy URL</button>
            </div>
            <button className="px-2 py-1 rounded-lg border" onClick={()=>onDelete(f.name)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

