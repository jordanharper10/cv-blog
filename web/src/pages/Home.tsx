import { useEffect, useState } from 'react';
import { getPosts, getProfile, getProjects, getTimeline, getContacts } from '../api';
import HeroCard from '../components/HeroCard';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Link } from 'react-router-dom';
import AlternatingTimeline from '../components/AlternatingTimeline';
import type { TimelineItem } from '../types';


export default function Home() {
  const [profile,setProfile] = useState<any>();
  const [projects,setProjects] = useState<any[]>([]);
  const [posts,setPosts] = useState<any[]>([]);
  const [timeline,setTimeline] = useState<TimelineItem[]>([]);
  const [contacts,setContacts] = useState<any[]>([]);

  useEffect(() => { (async()=>{
    setProfile(await getProfile());
    setProjects((await getProjects()).slice(0,3));
    setPosts((await getPosts()).slice(0,3));
    setTimeline((await getTimeline()).slice());
    setContacts(await getContacts());
  })(); }, []);

  const renderContact = (c:any) => {
    const looksEmail = /\S+@\S+\.\S+/.test(c.value);
    const href = c.url ? c.url : (looksEmail ? `mailto:${c.value}` : null);
    return href
      ? <a key={c.id} className="underline" href={href} target={c.url ? "_blank" : undefined} rel="noreferrer">{c.value}</a>
      : <span key={c.id}>{c.value}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {profile && <HeroCard profile={profile} />}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link to="/projects" className="text-sm underline">See all</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map(p => (
            <Link to="/projects" key={p.id} className="border rounded-2xl overflow-hidden hover:shadow transition">
              {/* Cover */}
              {p.cover_url && (
                <div className="aspect-[16/9] bg-gray-100">
                  <img
                    src={p.cover_url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              {/* Body */}
              <div className="p-4">
                <h3 className="font-medium">{p.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{p.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Latest Blog Posts</h2>
          <Link to="/blog" className="text-sm underline">See all</Link>
        </div>
        <div className="space-y-3">
          {posts.map(p => (
            <Link to={`/blog/${p.slug}`} key={p.id} className="block border rounded-2xl p-4 hover:shadow">
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">Timeline</h2>
        <AlternatingTimeline items={timeline} newestFirst={true} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        {contacts.length === 0 ? (
          <p className="text-sm text-gray-600">No contacts yet.</p>
        ) : (
          <ul className="space-y-1">
            {contacts.map(c => (
              <li key={c.id} className="text-sm">
                <span className="font-medium">{c.label}:</span>{' '}
                {renderContact(c)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

