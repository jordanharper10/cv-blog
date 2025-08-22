import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { whoami } from '../../api';

export default function AdminLayout(){
  const nav = useNavigate();
  const [ok, setOk] = useState<'checking'|'yes'|'no'>('checking');

  useEffect(() => {
    (async () => {
      try { await whoami(); setOk('yes'); }
      catch { setOk('no'); }
    })();
  }, []);

  useEffect(() => {
    if (ok === 'no') nav('/admin/login', { replace: true });
  }, [ok, nav]);

  if (ok !== 'yes') return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[220px,1fr] gap-6">
      <aside className="border rounded-2xl p-3 h-fit sticky top-20">
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin/general"  className="px-3 py-2 rounded-lg hover:bg-gray-100">General</NavLink>
          <NavLink to="/admin/contacts" className="px-3 py-2 rounded-lg hover:bg-gray-100">Contacts</NavLink>
          <NavLink to="/admin/timeline" className="px-3 py-2 rounded-lg hover:bg-gray-100">Timeline</NavLink>
          <NavLink to="/admin/projects" className="px-3 py-2 rounded-lg hover:bg-gray-100">Projects</NavLink>
          <NavLink to="/admin/posts"    className="px-3 py-2 rounded-lg hover:bg-gray-100">Blog Posts</NavLink>
          <NavLink to="/admin/cv" className="px-3 py-2 rounded-lg hover:bg-gray-100">CV</NavLink>
          <NavLink to="/admin/assets" className="px-3 py-2 rounded-lg hover:bg-gray-100">Assets</NavLink>
        </nav>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}

