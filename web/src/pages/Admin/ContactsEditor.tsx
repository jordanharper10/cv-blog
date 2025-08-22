import { useEffect, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import Banner from '../../components/Banner';
import { ApiError, createContact, deleteContact, getContacts, updateContact } from '../../api';
import { useNavigate } from 'react-router-dom';

export default function ContactsEditor(){
  const nav = useNavigate();
  const [rows,setRows] = useState<any[]>([]);
  const [err,setErr] = useState<string>('');
  const [draft,setDraft] = useState<any>({ label:'', value:'', url:'', sort:0 });
  const [editing,setEditing] = useState<any|null>(null);
  
  const load = async ()=> {
    try { setRows(await getContacts()); setErr(''); }
    catch (e:any){
      if (e instanceof ApiError && e.status === 401) {
        setErr('You are not logged in. Please sign in to manage contacts.');
      } else {
        setErr('Failed to load contacts.');
      }
    }
  };

  useEffect(()=>{ load(); },[]);

  async function saveNew(){
    try { await createContact(draft); setDraft({ label:'', value:'', url:'', sort:0 }); setErr(''); load(); }
    catch(e:any){
      if (e instanceof ApiError && e.status === 401) {
        setErr('Not authenticated. Redirecting to login…'); setTimeout(()=>nav('/admin/login'), 800);
      } else setErr('Save failed.');
    }
  }
  
  async function onEdit(row:any){
    try {
      const label = prompt('Label', row.label) || row.label;
      const value = prompt('Value', row.value) || row.value;
      const url = prompt('URL', row.url) || row.url;
      const sort = prompt('Sort', row.sort) || row.sort;
      await updateContact(row.id, { ...row, label, value: val, url, sort: Number(sort||0) });
      setErr(''); load();
    } catch(e:any){
      if (e instanceof ApiError && e.status === 401) {
        setErr('Not authenticated. Redirecting to login…'); setTimeout(()=>nav('/admin/login'), 800);
      } else setErr('Update failed.');
    }
  }
  
  async function onDelete(row:any){
    try { if(confirm('Delete?')) { await deleteContact(row.id); setErr(''); load(); } }
    catch(e:any){
      if (e instanceof ApiError && e.status === 401) {
        setErr('Not authenticated. Redirecting to login…'); setTimeout(()=>nav('/admin/login'), 800);
      } else setErr('Delete failed.');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Contacts</h1>
      <div className="grid md:grid-cols-4 gap-2">
        <input className="border p-2 rounded-xl" placeholder="Label" value={draft.label} onChange={e=>setDraft({...draft,label:e.target.value})} />
        <input className="border p-2 rounded-xl" placeholder="Value" value={draft.value} onChange={e=>setDraft({...draft,value:e.target.value})} />
        <input className="border p-2 rounded-xl" placeholder="URL (optional)" value={draft.url} onChange={e=>setDraft({...draft,url:e.target.value})} />
        <input className="border p-2 rounded-xl" placeholder="Sort" type="number" value={draft.sort} onChange={e=>setDraft({...draft,sort:Number(e.target.value)})} />
      </div>
      <button className="px-4 py-2 rounded-xl border" onClick={saveNew}>Add Contact</button>
      <CrudTable
        rows={rows}
        columns={[
          { key:'label', label:'Label' },
          { key:'value', label:'Value' },
          { key:'url', label:'URL' },
          { key:'sort', label:'Sort' },
        ]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

