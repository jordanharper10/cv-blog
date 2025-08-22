import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { whoami } from '../../api';

export default function AdminIndex() {
  const [state, setState] = useState<'checking'|'authed'|'anon'>('checking');

  useEffect(() => {
    (async () => {
      try { await whoami(); setState('authed'); }
      catch { setState('anon'); }
    })();
  }, []);

  if (state === 'checking') return null; // or a tiny spinner
  if (state === 'authed') return <Navigate to="general" replace />;
  return <Navigate to="/admin/login" replace />;
}

