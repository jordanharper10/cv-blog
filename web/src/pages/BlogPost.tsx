import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPost } from '../api';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function BlogPost(){
  const { slug } = useParams();
  const [post,setPost] = useState<any>();
  useEffect(()=>{ if(slug) getPost(slug).then(setPost); },[slug]);
  if(!post) return null;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">{post.title}</h1>
      {post.cover_url && <img src={post.cover_url} className="rounded-2xl"/>}
      <MarkdownRenderer md={post.body_md} />
    </div>
  );
}

