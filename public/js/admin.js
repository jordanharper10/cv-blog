(function () {
  const API = '/api/posts';
  const UPLOAD = '/api/upload';
  const $ = (id) => document.getElementById(id);

  function getToken() {
    return localStorage.getItem('BLOG_ADMIN_TOKEN') || '';
  }
  function setToken(v) {
    localStorage.setItem('BLOG_ADMIN_TOKEN', v || '');
  }

  async function api(path, opts = {}) {
    const headers = opts.headers || {};
    if (opts.method && opts.method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      headers['Authorization'] = `Bearer ${getToken()}`;
    }
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText} ${txt}`);
    }
    return res.status === 204 ? null : res.json();
  }

  // UI wiring
  $('saveToken').addEventListener('click', () => {
    setToken($('token').value.trim());
    alert('Token saved.');
  });
  $('reset').addEventListener('click', () => setForm());

  $('create').addEventListener('click', async () => {
    try {
      const body = readForm();
      const created = await api('', { method: 'POST', body: JSON.stringify(body) });
      alert('Created: ' + created.slug);
      setForm(created);
      await refreshList();
    } catch (e) {
      alert('Create failed: ' + e.message);
      // eslint-disable-next-line no-console
      console.error(e);
    }
  });

  $('update').addEventListener('click', async () => {
    try {
      const body = readForm();
      if (!body.slug) return alert('Slug is required to update.');
      const updated = await api('/' + encodeURIComponent(body.slug), {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      alert('Updated: ' + updated.slug);
      setForm(updated);
      await refreshList();
    } catch (e) {
      alert('Update failed: ' + e.message);
      console.error(e);
    }
  });


  $('uploadImage').addEventListener('click', async () => {
    const file = $('imageFile').files[0];
    if (!file) return alert('Pick an image first.');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(UPLOAD, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      insertAtCursor($('content'), `\n\n![alt text](${url})\n\n`);
      alert('Uploaded! Inserted markdown pointing to: ' + url);
      $('imageFile').value = '';
    } catch (e) {
      alert('Upload failed: ' + e.message);
    }
  });


  function readForm() {
    return {
      title: $('title').value.trim(),
      slug: $('slug').value.trim(),
      date: $('date').value.trim(),
      tags: $('tags').value.split(',').map(s => s.trim()).filter(Boolean),
      excerpt: $('excerpt').value,
      content: $('content').value
    };
  }

  function setForm(p = { title:'', slug:'', date:'', tags:[], excerpt:'', content:'' }) {
    $('title').value = p.title || '';
    $('slug').value = p.slug || '';
    $('date').value = p.date || '';
    $('tags').value = (p.tags || []).join(', ');
    $('excerpt').value = p.excerpt || '';
    $('content').value = p.content || '';
  }

  async function refreshList() {
    const posts = await api('?limit=0', { method: 'GET' });
    const tbody = document.querySelector('#postsTable tbody');
    tbody.innerHTML = '';
    posts.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(p.title)}</td>
        <td>${p.slug}</td>
        <td>${new Date(p.date).toLocaleString()}</td>
        <td>${(p.tags || []).join(', ')}</td>
        <td>
          <button data-slug="${p.slug}" class="load btn">Load</button>
          <button data-slug="${p.slug}" class="delete btn">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.load').forEach(b => {
      b.addEventListener('click', async () => {
        const slug = b.getAttribute('data-slug');
        const post = await api('/' + encodeURIComponent(slug), { method: 'GET' });
        setForm(post);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    tbody.querySelectorAll('.delete').forEach(b => {
      b.addEventListener('click', async () => {
        const slug = b.getAttribute('data-slug');
        if (!confirm(`Delete "${slug}"?`)) return;
        try {
          await api('/' + encodeURIComponent(slug), { method: 'DELETE' });
          await refreshList();
        } catch (e) {
          alert('Delete failed: ' + e.message);
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[c]));
  }

  function insertAtCursor(el, text) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + text + after;
    const pos = start + text.length;
    el.focus();
    el.setSelectionRange(pos, pos);
  }

  // init
  $('token').value = getToken();
  refreshList().catch(console.error);
})();
