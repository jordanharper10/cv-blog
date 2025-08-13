// Tab switching (same pattern as the calculator UI)
(function () {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabs.forEach(b => b.classList.toggle('active', b === btn));
      panels.forEach(p => {
        const isActive = p.id === `tab-${target}`;
        p.classList.toggle('active', isActive);
        p.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });
    });
  });

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();
})();
