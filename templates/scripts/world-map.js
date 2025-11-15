(function () {
  function goTo(continent) {
    const target = window.location.href.replace(/index\.html?$/i, 'countries.html');
    const href = target === window.location.href ? 'countries.html' : target;
    const u = new URL(href, window.location.href);
    u.searchParams.set('continent', continent);
    window.location.href = u.toString();
  }

  window.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('worldMap');
    if (!svg) return;
    svg.addEventListener('click', (e) => {
      const g = e.target.closest('[data-continent]');
      if (g) goTo(g.getAttribute('data-continent'));
    });
  });
})();
