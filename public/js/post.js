(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  if (!slug) {
    document.getElementById('content').textContent = 'Missing slug.';
    return;
  }
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await res.text());
    const p = await res.json();
    document.getElementById('title').textContent = p.title;
    document.getElementById('meta').textContent =
      `${new Date(p.date).toLocaleString()} • ${(p.tags || []).join(', ')}`;
    document.getElementById('content').innerHTML = p.html || '';
  } catch (e) {
    document.getElementById('content').textContent = 'Failed to load post.';
    console.error(e);
  }
})();
