import { useEffect, useState } from 'react';
import Banner from '../../components/Banner';
import CrudTable from '../../components/CrudTable';
import EditModal from '../../components/EditModal';
import { Field, TextInput, TextArea } from '../../components/Field';
import {
  getCV, updateCvMeta,
  createCvExp, updateCvExp, deleteCvExp,
  createCvEdu, updateCvEdu, deleteCvEdu,
  createCvCert, updateCvCert, deleteCvCert,
  createCvSkill, updateCvSkill, deleteCvSkill,
  createCvLink, updateCvLink, deleteCvLink
} from '../../api';

export default function CvEditor(){
  const [cv,setCv] = useState<any>(null);
  const [err,setErr] = useState('');
  const [mod,setMod] = useState<{type:string, open:boolean, row:any}>({type:'', open:false, row:null});

  const load = ()=> getCV().then(setCv).catch(()=>setErr('Failed to load CV'));
  useEffect(()=>{ load(); },[]);

  // Meta save
  async function saveMeta(){
    try { await updateCvMeta(cv.meta || {}); setErr(''); alert('Saved'); }
    catch { setErr('Save failed'); }
  }

  // Helpers to open modals
  const openModal = (type:string, row:any=null) => setMod({ type, open:true, row: row ? {...row} : {} });
  const closeModal = () => setMod({ type:'', open:false, row:null });

  // Persist handlers per type
  async function saveModal(){
    try {
      const { type, row } = mod;
      if(type==='exp'){ row.bullets = toArray(row.bullets); row.tech = toArray(row.tech);
        row.sort = +row.sort||0;
        if(row.id) await updateCvExp(row.id,row); else await createCvExp(row);
      }
      if (type === 'cert') {
        row.sort = +row.sort || 0;
        if (row.id) {
          await updateCvCert(row.id, row);
        } else {
          await createCvCert(row);
        }
      }
      if(type==='edu'){ row.notes = toArray(row.notes); row.sort = +row.sort||0;
        if(row.id) await updateCvEdu(row.id,row); else await createCvEdu(row);
      }
      if(type==='skill'){ row.items = toArray(row.items); row.sort = +row.sort||0;
        if(row.id) await updateCvSkill(row.id,row); else await createCvSkill(row);
      }
      if(type==='link'){ row.sort = +row.sort||0;
        if(row.id) await updateCvLink(row.id,row); else await createCvLink(row);
      }
      closeModal(); load();
    } catch { setErr('Save failed'); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">CV Editor</h1>
      {err && <Banner>{err}</Banner>}

      {/* Meta */}
      <section className="border rounded-2xl p-4 space-y-3">
        <h2 className="font-medium">Meta</h2>
        <div className="grid md:grid-cols-2 gap-3">
        <Field label="Name"><TextInput value={cv?.meta?.name||''} onChange={e=>setCv((s:any)=>({ ...s, meta:{ ...(s?.meta||{}), name:e.target.value } }))}/></Field>
        <Field label="Tagline"><TextInput value={cv?.meta?.tagline||''} onChange={e=>setCv((s:any)=>({ ...s, meta:{ ...(s?.meta||{}), tagline:e.target.value } }))}/></Field>
        <Field label="Location"><TextInput value={cv?.meta?.location||''} onChange={e=>setCv((s:any)=>({ ...s, meta:{ ...(s?.meta||{}), location:e.target.value } }))}/></Field>

        </div>
        <button className="px-3 py-2 rounded-xl border" onClick={saveMeta}>Save Meta</button>
      </section>

      {/* Experience */}
      <section className="border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Experience</h2>
          <button className="px-3 py-2 rounded-xl border" onClick={()=>openModal('exp')}>Add</button>
        </div>
        <CrudTable
          rows={cv?.exp||[]}
          columns={[
            { key:'company', label:'Company' },
            { key:'role', label:'Role' },
            { key:'start_date', label:'Start' },
            { key:'end_date', label:'End' },
            { key:'sort', label:'Sort' },
          ]}
          onEdit={row=>openModal('exp',row)}
          onDelete={row=>{ if(confirm('Delete?')) deleteCvExp(row.id).then(load) }}
        />
      </section>

      <section className="border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Certifications</h2>
          <button className="px-3 py-2 rounded-xl border" onClick={()=>openModal('cert')}>Add</button>
        </div>
        <CrudTable
          rows={cv?.certs||[]}
          columns={[
            { key:'name', label:'Name' },
            { key:'issuer', label:'Issuer' },
            { key:'issued', label:'Issued' },
            { key:'url', label:'URL' },
            { key:'sort', label:'Sort' },
          ]}
          onEdit={row=>openModal('cert',row)}
          onDelete={row=>{ if(confirm('Delete?')) deleteCvCert(row.id).then(load) }}
        />
      </section>     

      {/* Education */}
      <section className="border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Education</h2>
          <button className="px-3 py-2 rounded-xl border" onClick={()=>openModal('edu')}>Add</button>
        </div>
        <CrudTable
          rows={cv?.edu||[]}
          columns={[
            { key:'school', label:'School' },
            { key:'degree', label:'Degree' },
            { key:'end_date', label:'End' },
            { key:'sort', label:'Sort' },
          ]}
          onEdit={row=>openModal('edu',row)}
          onDelete={row=>{ if(confirm('Delete?')) deleteCvEdu(row.id).then(load) }}
        />
      </section>

      {/* Skills */}
      <section className="border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Skills</h2>
          <button className="px-3 py-2 rounded-xl border" onClick={()=>openModal('skill')}>Add</button>
        </div>
        <CrudTable
          rows={cv?.skills||[]}
          columns={[
            { key:'category', label:'Category' },
            { key:'items', label:'Items', render:(v:any)=>Array.isArray(v)?v.join(', '):'' },
            { key:'sort', label:'Sort' },
          ]}
          onEdit={row=>openModal('skill',row)}
          onDelete={row=>{ if(confirm('Delete?')) deleteCvSkill(row.id).then(load) }}
        />
      </section>

      {/* Links */}
      <section className="border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Links</h2>
        <button className="px-3 py-2 rounded-xl border" onClick={()=>openModal('link')}>Add</button>
        </div>
        <CrudTable
          rows={cv?.links||[]}
          columns={[
            { key:'label', label:'Label' },
            { key:'url', label:'URL' },
            { key:'sort', label:'Sort' },
          ]}
          onEdit={row=>openModal('link',row)}
          onDelete={row=>{ if(confirm('Delete?')) deleteCvLink(row.id).then(load) }}
        />
      </section>

      {/* Modal content (switch by type) */}
      <EditModal open={mod.open} title={titleFor(mod.type, mod.row)} onClose={closeModal} onSave={saveModal}>
        {mod.type==='exp' && <ExpForm row={mod.row} setRow={(r:any)=>setMod(m=>({ ...m, row:r }))} />}
        {mod.type==='cert' && <CertForm row={mod.row} setRow={(r:any)=>setMod(m=>({ ...m, row:r }))} />}
        {mod.type==='edu' && <EduForm row={mod.row} setRow={(r:any)=>setMod(m=>({ ...m, row:r }))} />}
        {mod.type==='skill' && <SkillForm row={mod.row} setRow={(r:any)=>setMod(m=>({ ...m, row:r }))} />}
        {mod.type==='link' && <LinkForm row={mod.row} setRow={(r:any)=>setMod(m=>({ ...m, row:r }))} />}
      </EditModal>
    </div>
  );
}

function titleFor(type:string, row:any){ const isEdit = !!row?.id;
  return type==='exp' ? (isEdit?'Edit Experience':'New Experience')
    : type==='edu' ? (isEdit?'Edit Education':'New Education')
    : type==='skill' ? (isEdit?'Edit Skill Group':'New Skill Group')
    : type==='link' ? (isEdit?'Edit Link':'New Link')
    : 'Edit';
}

function toArray(v:any){
  if(Array.isArray(v)) return v;
  if(typeof v==='string') return v.split(',').map(x=>x.trim()).filter(Boolean);
  return [];
}

// --- Forms ---
function ExpForm({row,setRow}:{row:any; setRow:(r:any)=>void}){
  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Company"><TextInput value={row.company||''} onChange={e=>setRow({...row, company:e.target.value})}/></Field>
        <Field label="Role"><TextInput value={row.role||''} onChange={e=>setRow({...row, role:e.target.value})}/></Field>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Location"><TextInput value={row.location||''} onChange={e=>setRow({...row, location:e.target.value})}/></Field>
        <Field label="Start (YYYY-MM)"><TextInput value={row.start_date||''} onChange={e=>setRow({...row, start_date:e.target.value})}/></Field>
        <Field label="End (YYYY-MM or Present)"><TextInput value={row.end_date||''} onChange={e=>setRow({...row, end_date:e.target.value})}/></Field>
      </div>
      <Field label="Bullets (comma-separated)"><TextInput value={arrToStr(row.bullets)} onChange={e=>setRow({...row, bullets:e.target.value})}/></Field>
      <Field label="Tech (comma-separated)"><TextInput value={arrToStr(row.tech)} onChange={e=>setRow({...row, tech:e.target.value})}/></Field>
      <Field label="Sort (lower shows first)"><TextInput type="number" value={row.sort||0} onChange={e=>setRow({...row, sort:e.target.value})}/></Field>
    </div>
  );
}
function CertForm({row,setRow}:{row:any; setRow:(r:any)=>void}){
  return (
    <div className="space-y-3">
      <Field label="Name"><TextInput value={row.name||''} onChange={e=>setRow({...row, name:e.target.value})}/></Field>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Issuer"><TextInput value={row.issuer||''} onChange={e=>setRow({...row, issuer:e.target.value})}/></Field>
        <Field label="Issued (YYYY-MM)"><TextInput value={row.issued||''} onChange={e=>setRow({...row, issued:e.target.value})}/></Field>
        <Field label="Sort"><TextInput type="number" value={row.sort||0} onChange={e=>setRow({...row, sort:e.target.value})}/></Field>
      </div>
      <Field label="URL (verification link)">
        <TextInput value={row.url||''} onChange={e=>setRow({...row, url:e.target.value})}/>
      </Field>
    </div>
  );
}
function EduForm({row,setRow}:{row:any; setRow:(r:any)=>void}){
  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="School"><TextInput value={row.school||''} onChange={e=>setRow({...row, school:e.target.value})}/></Field>
        <Field label="Degree"><TextInput value={row.degree||''} onChange={e=>setRow({...row, degree:e.target.value})}/></Field>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Location"><TextInput value={row.location||''} onChange={e=>setRow({...row, location:e.target.value})}/></Field>
        <Field label="Start (YYYY-MM)"><TextInput value={row.start_date||''} onChange={e=>setRow({...row, start_date:e.target.value})}/></Field>
        <Field label="End (YYYY-MM)"><TextInput value={row.end_date||''} onChange={e=>setRow({...row, end_date:e.target.value})}/></Field>
      </div>
      <Field label="Notes (comma-separated)"><TextInput value={arrToStr(row.notes)} onChange={e=>setRow({...row, notes:e.target.value})}/></Field>
      <Field label="Sort (lower shows first)"><TextInput type="number" value={row.sort||0} onChange={e=>setRow({...row, sort:e.target.value})}/></Field>
    </div>
  );
}
function SkillForm({row,setRow}:{row:any; setRow:(r:any)=>void}){
  return (
    <div className="space-y-3">
      <Field label="Category"><TextInput value={row.category||''} onChange={e=>setRow({...row, category:e.target.value})}/></Field>
      <Field label="Items (comma-separated)"><TextInput value={arrToStr(row.items)} onChange={e=>setRow({...row, items:e.target.value})}/></Field>
      <Field label="Sort (lower shows first)"><TextInput type="number" value={row.sort||0} onChange={e=>setRow({...row, sort:e.target.value})}/></Field>
    </div>
  );
}
function LinkForm({row,setRow}:{row:any; setRow:(r:any)=>void}){
  return (
    <div className="space-y-3">
      <Field label="Label"><TextInput value={row.label||''} onChange={e=>setRow({...row, label:e.target.value})}/></Field>
      <Field label="URL"><TextInput value={row.url||''} onChange={e=>setRow({...row, url:e.target.value})}/></Field>
      <Field label="Sort (lower shows first)"><TextInput type="number" value={row.sort||0} onChange={e=>setRow({...row, sort:e.target.value})}/></Field>
    </div>
  );
}
function arrToStr(v:any){ return Array.isArray(v) ? v.join(', ') : (v || ''); }

