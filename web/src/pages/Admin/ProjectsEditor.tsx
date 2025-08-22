import { useEffect, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import Banner from '../../components/Banner';
import EditModal from '../../components/EditModal';
import UploadButton from '../../components/UploadButton';
import { Field, TextInput, TextArea, Checkbox } from '../../components/Field';
import { ApiError, createProject, deleteProject, getProjects, updateProject } from '../../api';

export default function ProjectsEditor() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);
  const empty = { id:null, title:'', summary:'', tags:'', url:'', repo_url:'', cover_url:'', featured:0 };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    try { setRows(await getProjects()); setErr(''); }
    catch { setErr('Failed to load projects'); }
  };
  useEffect(() => { load(); }, []);

  function edit(row?:any){ setForm(row ? {...row} : {...empty}); setOpen(true); }
  function validate(f:any){ if(!f.title) return 'Title is required'; return ''; }

  async function save(){
    const v = validate(form); if(v) return setErr(v);
    try {
      const payload = { ...form, featured: form.featured ? 1 : 0 };
      if (form.id) await updateProject(form.id, payload); else await createProject(payload);
      setOpen(false); setErr(''); load();
    } catch(e:any){ setErr(e?.status===401 ? 'Not authenticated.' : 'Save failed.'); }
  }
  async function remove(row:any){
    if(!confirm('Delete project?')) return;
    try { await deleteProject(row.id); load(); } catch { setErr('Delete failed.'); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Projects</h1>
      {err && <Banner>{err}</Banner>}
      <button className="px-4 py-2 rounded-xl border" onClick={()=>edit()}>Add Project</button>

      <CrudTable
        rows={rows}
        columns={[
          { key:'title', label:'Title' },
          { key:'summary', label:'Summary' },
          { key:'url', label:'Live' },
          { key:'repo_url', label:'GitHub' },
        ]}
        onEdit={edit}
        onDelete={remove}
      />

      <EditModal open={open} title={form.id ? 'Edit Project' : 'New Project'} onClose={()=>setOpen(false)} onSave={save}>
        <Field label="Title"><TextInput value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/></Field>
        <Field label="Summary"><TextArea rows={4} value={form.summary} onChange={e=>setForm({...form, summary:e.target.value})}/></Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Tags (comma-separated)"><TextInput value={form.tags||''} onChange={e=>setForm({...form, tags:e.target.value})}/></Field>
          <Field label="Featured"><Checkbox label="Show prominently" checked={!!form.featured} onChange={e=>setForm({...form, featured: e.target.checked})}/></Field>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Live URL"><TextInput value={form.url||''} onChange={e=>setForm({...form, url:e.target.value})} placeholder="https://..."/></Field>
          <Field label="Repo URL"><TextInput value={form.repo_url||''} onChange={e=>setForm({...form, repo_url:e.target.value})} placeholder="https://github.com/..."/></Field>
        </div>
        <Field label="Cover">
          <div className="flex items-center gap-3">
            <UploadButton label="Upload cover" onUploaded={(url)=>setForm((f:any)=>({...f, cover_url:url}))}/>
            {form.cover_url && <img src={form.cover_url} className="h-12 rounded-lg" />}
          </div>
        </Field>
      </EditModal>
    </div>
  );
}

