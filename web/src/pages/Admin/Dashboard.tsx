import { useState } from 'react';
import { api, uploadFile } from '../../api';

export default function Dashboard(){
  const [title,setTitle] = useState('');
  const [slug,setSlug] = useState('');
  const [excerpt,setExcerpt] = useState('');
  const [body,setBody] = useState('');
  const [cover,setCover] = useState<string>('');


  async function save(){
    await api('/posts',{ method:'POST', body: JSON.stringify({ title, slug, excerpt, body_md: body, cover_url: cover }) });
    alert('Saved!');
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return;
    const { url } = await uploadFile(f); setCover(url);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      <h1 className="text-xl font-semibold">Admin · New Post</h1>
      <input className="border p-2 w-full rounded-xl" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="border p-2 w-full rounded-xl" placeholder="Slug (unique)" value={slug} onChange={e=>setSlug(e.target.value)} />
      <input className="border p-2 w-full rounded-xl" placeholder="Excerpt" value={excerpt} onChange={e=>setExcerpt(e.target.value)} />
      <textarea className="border p-2 w-full rounded-xl h-56 font-mono" placeholder="Markdown body" value={body} onChange={e=>setBody(e.target.value)} />
      <input type="file" onChange={onFile} />
      {cover && <img src={cover} className="rounded-xl" />}
      <button className="px-4 py-2 rounded-xl border" onClick={save}>Save Post</button>
    </div>
  );
}
