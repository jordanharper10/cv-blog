import { useEffect, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import Banner from '../../components/Banner';
import EditModal from '../../components/EditModal';
import { Field, TextInput, TextArea } from '../../components/Field';
import { ApiError, createTimeline, deleteTimeline, getTimeline, updateTimeline } from '../../api';

export default function TimelineEditor() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);
  const empty = { id:null, date:'', label:'', description:'', icon:'' };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    try { setRows(await getTimeline()); setErr(''); }
    catch (e:any) { setErr('Failed to load timeline'); }
  };
  useEffect(() => { load(); }, []);

  function edit(row?:any){ setForm(row ? {...row} : {...empty}); setOpen(true); }
  function validate(f:any){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return 'Date must be YYYY-MM-DD';
    if(!f.label) return 'Label is required';
    return '';
  }
  async function save(){
    const v = validate(form);
    if (v) return setErr(v);
    try {
      if (form.id) await updateTimeline(form.id, form); else await createTimeline(form);
      setOpen(false); setErr(''); load();
    } catch(e:any){
      setErr(e?.status===401 ? 'Not authenticated.' : 'Save failed.');
    }
  }
  async function remove(row:any){
    if(!confirm('Delete this entry?')) return;
    try { await deleteTimeline(row.id); load(); } catch { setErr('Delete failed.'); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Timeline</h1>
      {err && <Banner>{err}</Banner>}

      <button className="px-4 py-2 rounded-xl border" onClick={()=>edit()}>Add Entry</button>

      <CrudTable
        rows={rows}
        columns={[
          { key:'date', label:'Date' },
          { key:'label', label:'Label' },
          { key:'description', label:'Description' },
          { key:'icon', label:'Icon' },
        ]}
        onEdit={edit}
        onDelete={remove}
      />

      <EditModal open={open} title={form.id ? 'Edit Timeline Entry' : 'New Timeline Entry'} onClose={()=>setOpen(false)} onSave={save}>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Date (YYYY-MM-DD)">
            <TextInput value={form.date} onChange={e=>setForm({...form, date:e.target.value})} placeholder="2023-07-01"/>
          </Field>
          <Field label="Icon (optional)">
            <TextInput value={form.icon||''} onChange={e=>setForm({...form, icon:e.target.value})} placeholder="e.g., briefcase"/>
          </Field>
        </div>
        <Field label="Label">
          <TextInput value={form.label} onChange={e=>setForm({...form, label:e.target.value})} placeholder="Promotion to Senior Engineer"/>
        </Field>
        <Field label="Description">
          <TextArea rows={4} value={form.description||''} onChange={e=>setForm({...form, description:e.target.value})} />
        </Field>
      </EditModal>
    </div>
  );
}

