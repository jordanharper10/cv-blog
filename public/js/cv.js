// Load profile data from backend (mirrors how we split logic before)
(async function loadCV() {
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();

    document.getElementById('site-title').textContent = data.name || 'Your Name';
    document.getElementById('site-subtitle').textContent = data.title || '';
    document.getElementById('site-location').textContent = data.location || '';

    document.getElementById('cv-summary').innerHTML = data.summary || '';

    const skills = document.getElementById('cv-skills');
    skills.innerHTML = '';
    (data.skills || []).forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      skills.appendChild(li);
    });

    const contact = document.getElementById('cv-contact');
    contact.innerHTML = '';
    if (data.contact?.email) {
      contact.insertAdjacentHTML('beforeend',
        `<li><pre>Email       <a href="mailto:${data.contact.email}">${data.contact.email}</a></pre></li>`);
    }
    if (data.contact?.linkedin) {
      contact.insertAdjacentHTML('beforeend',
        `<li><pre>LinkedIn    <a href="${data.contact.linkedin}" target="_blank" rel="noreferrer">${data.contact.linkedin.replace('https://linkedin.com/in/','')}</a></pre></li>`);
    }
    if (data.contact?.github) {
      contact.insertAdjacentHTML('beforeend',
        `<li><pre>GitHub      <a href="${data.contact.github}" target="_blank" rel="noreferrer">${data.contact.github.replace('https://github.com/','')}</a></pre></li>`);
    }
  } catch (e) {
    document.getElementById('cv-summary').textContent = 'Failed to load profile.';
    // eslint-disable-next-line no-console
    console.error(e);
  }
})();
