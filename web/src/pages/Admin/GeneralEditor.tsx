import { useEffect, useState } from 'react';
import Banner from '../../components/Banner';
import { ApiError, getProfile, updateProfile, uploadFile } from '../../api';
import { useNavigate } from 'react-router-dom';
import UploadButton from '../../components/UploadButton';

const ICON_CHOICES = [
  'github','linkedin','twitter','x','instagram','youtube','facebook',
  'gitlab','discord','bitbucket','mail','globe','link'
];

export default function GeneralEditor(){
  const nav = useNavigate();
  const [err,setErr] = useState<string>('');
  const [form,setForm] = useState<any>({ name:'', title:'', location:'', photo_url:'', socials:{}, certs:[] });
  const [draft, setDraft] = useState<any>({ key:'', url:'', icon:'link' });
  const [newCert,setNewCert] = useState('');
  const [k,setK] = useState(''); const [v,setV] = useState('');

  useEffect(()=>{
    getProfile().then((p:any)=>{
      let socialsRaw = p.socials;
      if (typeof socialsRaw === 'string') {
        try { socialsRaw = JSON.parse(socialsRaw); } catch { socialsRaw = []; }
      }

      let socials: any[] = [];
      if (Array.isArray(socialsRaw)) socials = socialsRaw.filter((s:any)=>s && s.url);
      else if (socialsRaw && typeof socialsRaw === 'object') {
        socials = Object.entries(socialsRaw).map(([key, url]: any) => ({ key, url: String(url), icon: key }));
      }

      let certsRaw = p.certs;
      if (typeof certsRaw === 'string') {
        try { certsRaw = JSON.parse(certsRaw); } catch { certsRaw = []; }
      }
      const certs: string[] = Array.isArray(certsRaw) ? certsRaw : [];

      setForm({ ...p, socials, certs });  
  }); 
},[]);

  async function save(){
    try {
      const payload = {
        ...form,
        socials: Array.isArray(form.socials) ? form.socials : [],
        certs: Array.isArray(form.certs) ? form.certs : []
      };
      await updateProfile(payload);
      alert('Saved');
      setErr('');}
    catch(e:any){
      if (e instanceof ApiError && e.status === 401) {
        setErr('Not authenticated. Redirecting to login…'); setTimeout(()=>nav('/admin/login'), 800);
      } else setErr('Save failed.');
    }
  }

  function addSocial(){
    if (!draft.key || !draft.url) return;
    setForm((s:any)=>({ ...s, socials: [ ...(s.socials||[]), draft ] }));
    setDraft({ key:'', url:'', icon:'link' });
  }

  function updateSocial(idx:number, patch:any){
    setForm((s:any)=>{
      const arr = [...(s.socials||[])];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...s, socials: arr };
    });
  }

  function removeSocial(idx:number){
    setForm((s:any)=>({ ...s, socials: (s.socials||[]).filter((_:any,i:number)=>i!==idx) }));
  }

  async function onPhoto(e:React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return; const { url } = await uploadFile(f); setForm((s:any)=>({ ...s, photo_url: url }));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">General Information</h1>

      {/* Name/Title/Location/Photo */}
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">Name<input className="border p-2 w-full rounded-xl" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></label>
        <label className="block">Title<input className="border p-2 w-full rounded-xl" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/></label>
        <label className="block">Location<input className="border p-2 w-full rounded-xl" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/></label>
        <label className="block">Photo
          <div className="flex items-center gap-3 mt-1">
            <UploadButton
              label="Upload photo"
              onUploaded={(url) => setForm((s:any)=>({ ...s, photo_url: url }))}
            />
            {form.photo_url && <img src={form.photo_url} className="h-12 rounded-xl" />}
          </div>
        </label>
      </div>

      {/* Socials */}
      <div>
        <h2 className="font-medium mb-2">Social Links</h2>
        
        {/* Add new */}
        <div className="grid md:grid-cols-4 gap-2 mb-3">
          <input className="border p-2 rounded-xl" placeholder="Key (e.g., github)" value={draft.key} onChange={e=>setDraft({...draft,key:e.target.value})}/>
          <input className="border p-2 rounded-xl md:col-span-2" placeholder="https://..." value={draft.url} onChange={e=>setDraft({...draft,url:e.target.value})}/>
          <select className="border p-2 rounded-xl" value={draft.icon} onChange={e=>setDraft({...draft,icon:e.target.value})}>
            {ICON_CHOICES.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <button className="px-3 rounded-xl border" onClick={addSocial}>Add Social</button>

        {/* Existing list */}
        <ul className="mt-3 space-y-2">
          {(Array.isArray(form.socials) ? form.socials : []).map((s:any, i:number) => (
            <li key={i} className="grid md:grid-cols-4 gap-2 items-center">
              <input className="border p-2 rounded-xl" value={s.key} onChange={e=>updateSocial(i,{ key:e.target.value })}/>
              <input className="border p-2 rounded-xl md:col-span-2" value={s.url} onChange={e=>updateSocial(i,{ url:e.target.value })}/>
              <select className="border p-2 rounded-xl" value={s.icon || s.key} onChange={e=>updateSocial(i,{ icon:e.target.value })}>
                {ICON_CHOICES.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <div className="md:col-span-4">
                <button className="px-2 py-1 rounded border" onClick={()=>removeSocial(i)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Certs Grid*/}
      <div>
        <h2 className="font-medium mb-2">Certification Badges (image URLs)</h2>
        <div className="flex gap-2">
          <input className="border p-2 rounded-xl flex-1" placeholder="https://" value={newCert} onChange={e=>setNewCert(e.target.value)} />
          <button className="px-3 rounded-xl border" onClick={()=>{ if(!newCert) return; setForm((s:any)=>({ ...s, certs: [ ...(s.certs||[]), newCert ] })); setNewCert(''); }}>Add</button>
        </div>
        <ul className="mt-2 grid md:grid-cols-4 gap-2">
          {(Array.isArray(form.certs) ? form.certs : []).map((c:string, i:number) => (
            <li key={i} className="border rounded-xl p-2 flex items-center gap-2">
              <img src={c} className="h-8"/>
              <button className="ml-auto px-2 py-1 rounded border" onClick={()=>setForm((s:any)=>({ ...s, certs: s.certs.filter((_:any,idx:number)=>idx!==i) }))}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <button className="px-4 py-2 rounded-xl border" onClick={save}>Save All</button>
    </div>
  );
}
