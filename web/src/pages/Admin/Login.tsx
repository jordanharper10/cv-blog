import { useState } from 'react';
import { login } from '../../api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const nav = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');

  async function submit(){
    try {
      await login(email, password);
      nav('/admin/general');
    } catch(e:any) {
      setErr('Login failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10 space-y-3">
      <h1 className="text-xl font-semibold">Admin Login</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <input className="border p-2 w-full rounded-xl"
             placeholder="Email"
             value={email}
             onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full rounded-xl"
             placeholder="Password"
             type="password"
             value={password}
             onChange={e=>setPassword(e.target.value)} />
      <button className="px-4 py-2 rounded-xl border" onClick={submit}>Login</button>
    </div>
  );
}

