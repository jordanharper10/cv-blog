import { useEffect, useState } from 'react';
import { getPosts } from '../api';
import { Link } from 'react-router-dom';

export default function BlogList(){
  const [posts,setPosts] = useState<any[]>([]);
  useEffect(()=>{ getPosts().then(setPosts); },[]);
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      {posts.map(p => (
        <Link to={`/blog/${p.slug}`} key={p.id} className="block border rounded-2xl p-4 hover:shadow">
          <div className="text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</div>
          <h3 className="font-medium">{p.title}</h3>
          <p className="text-sm text-gray-600">{p.excerpt}</p>
        </Link>
      ))}
    </div>
  );
}

