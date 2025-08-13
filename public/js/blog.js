(async function loadPosts() {
  try {
    const res = await fetch('/api/posts?limit=10', { cache: 'no-store' });
    const posts = await res.json();

    const list = document.getElementById('posts-list');
    list.innerHTML = '';

    posts.forEach(p => {
      const el = document.createElement('article');
      el.className = 'post';
      el.innerHTML = `
        <h4><a href="/post.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a></h4>
        <div class="meta">${new Date(p.date).toLocaleDateString()} • ${p.tags?.join(', ') || ''}</div>
        <p>${p.excerpt || ''}</p>
      `;
      list.appendChild(el);
    });
  } catch (e) {
    document.getElementById('posts-list').textContent = 'Failed to load posts.';
    console.error(e);
  }
})();
