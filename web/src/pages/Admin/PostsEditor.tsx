import { useEffect, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import Banner from '../../components/Banner';
import EditModal from '../../components/EditModal';
import UploadButton from '../../components/UploadButton';
import { Field, TextInput, TextArea, Checkbox } from '../../components/Field';
import { ApiError, createPost, deletePost, getPosts, getPostsAdmin, updatePost } from '../../api';

export default function PostsEditor() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);
  const empty = { id:null, title:'', slug:'', excerpt:'', body_md:'', cover_url:'', published:1 };
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    try { setRows(await getPostsAdmin()); setErr(''); }
    catch { setErr('Failed to load posts'); }
  };
  useEffect(() => { load(); }, []);

  function edit(row?:any){ setForm(row ? {...row} : {...empty}); setOpen(true); }
  function validate(f:any){
    if(!f.title) return 'Title is required';
    if(!/^[a-z0-9-]+$/.test((f.slug||'').trim())) return 'Slug must be lowercase letters, numbers, dashes';
    return '';
  }

  async function save(){
    const v = validate(form); if(v) return setErr(v);
    try {
      const payload = { ...form, published: form.published ? 1 : 0 };
      if (form.id) await updatePost(form.id, payload); else await createPost(payload);
      setOpen(false); setErr(''); load();
    } catch(e:any){ setErr(e?.status===401 ? 'Not authenticated.' : 'Save failed.'); }
  }
  async function remove(row:any){
    if(!confirm('Delete post?')) return;
    try { await deletePost(row.id); load(); } catch { setErr('Delete failed.'); }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Blog Posts</h1>
      {err && <Banner>{err}</Banner>}
      <button className="px-4 py-2 rounded-xl border" onClick={()=>edit()}>New Post</button>

      <CrudTable
        rows={rows}
        columns={[
          { key:'title', label:'Title' },
          { key:'slug', label:'Slug' },
          { key:'created_at', label:'Date' },
        ]}
        onEdit={edit}
        onDelete={remove}
      />

      <EditModal open={open} title={form.id ? 'Edit Post' : 'New Post'} onClose={()=>setOpen(false)} onSave={save}>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Title"><TextInput value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/></Field>
          <Field label="Slug"><TextInput value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} placeholder="my-post-title"/></Field>
        </div>
        <Field label="Excerpt"><TextArea rows={3} value={form.excerpt||''} onChange={e=>setForm({...form, excerpt:e.target.value})}/></Field>

        <div className="grid md:grid-cols-2 gap-3 items-center">
          <Field label="Cover">
            <div className="flex items-center gap-3">
              <UploadButton label="Upload cover" onUploaded={(url)=>setForm((f:any)=>({...f, cover_url:url}))}/>
              {form.cover_url && <img src={form.cover_url} className="h-12 rounded-lg" />}
            </div>
          </Field>
          <Field label="Published">
            <Checkbox label="Visible on site" checked={!!form.published} onChange={e=>setForm({...form, published:e.target.checked})}/>
          </Field>
        </div>

        <Field label="Body (Markdown)">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UploadButton label="Upload & insert image" onUploaded={(url,f)=>setForm((x:any)=>({ ...x, body_md: `${x.body_md||''}\n\n![${f.name}](${url})\n` }))}/>
            </div>
            <TextArea rows={14} value={form.body_md||''} onChange={e=>setForm({...form, body_md:e.target.value})} />
          </div>
        </Field>
      </EditModal>
    </div>
  );
}

