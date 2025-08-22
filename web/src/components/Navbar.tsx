import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const item = (to:string, label:string) => (
    <NavLink to={to} className={({isActive}) => `px-3 py-2 rounded-lg hover:bg-gray-100 ${isActive? 'font-semibold underline' : ''}`}>{label}</NavLink>
  );
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold">Jordan Harper</Link>
        <nav className="flex gap-2">
          {item('/', 'Home')}
          {item('/projects', 'Projects')}
          {item('/blog', 'Blog')}
          {item('/cv', 'CV')}
          {item('/admin/login', 'Admin')}
        </nav>
      </div>
    </header>
  );
}
