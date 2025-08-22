import { useEffect, useState } from 'react';
import { getProjects } from '../api';

export default function Projects(){
  const [items,setItems] = useState<any[]>([]);
  useEffect(()=>{ getProjects().then(setItems); },[]);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4">
      {items.map(p => (
        <article key={p.id} className="border rounded-2xl p-4">
          <h3 className="font-medium">{p.title}</h3>
          <p className="text-sm text-gray-600">{p.summary}</p>
          <div className="mt-2 text-sm">
            {p.url && <a className="underline mr-3" href={p.url} target="_blank" rel="noreferrer">Live</a>}
            {p.repo_url && <a className="underline" href={p.repo_url} target="_blank" rel="noreferrer">GitHub</a>}
          </div>
        </article>
      ))}
    </div>
  );
}

