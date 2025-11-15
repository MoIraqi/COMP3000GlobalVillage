(function () {
  function setBreadcrumb(continent){
    const bc = document.getElementById('breadcrumb');
    if(!bc) return;
    const home = '<a href="../index.html" class="hover:underline">Home</a>';
    if (!continent) { bc.innerHTML = home + ' / Countries'; return; }
    const url = new URL('countries.html', location.href);
    url.searchParams.set('continent', continent);
    bc.innerHTML = `${home} / <a class="hover:underline" href="../countries.html">Countries</a> / <a class="hover:underline" href="${url.toString()}">${continent}</a>`;
  }

  function getParam(name) {
    return new URL(window.location.href).searchParams.get(name);
  }

  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function renderGrid(continent) {
    setBreadcrumb(continent);
    const title = document.getElementById('continentTitle');
    const grid = document.getElementById('countryGrid');
    const data = (window.GV_COUNTRIES || []).filter(c => !continent || c.continent === continent);
    title.textContent = continent ? `${continent} — Countries` : 'All Countries';
    grid.innerHTML = '';

    data.forEach(country => {
      const card = h('button', {
        class: 'group relative rounded-xl bg-white shadow hover:shadow-md border border-slate-100 overflow-hidden',
        'data-name': country.name
      }, [
        h('img', { src: country.flag, alt: `${country.name} flag`, class: 'w-full aspect-video object-cover' }),
        h('div', { class: 'p-3 text-left' }, [
          h('div', { class: 'font-semibold' }, [country.name]),
          h('div', { class: 'text-xs text-slate-500' }, [country.continent])
        ])
      ]);
      card.addEventListener('click', () => openDetail(country));
      grid.appendChild(card);
    });
  }

  function openDetail(country) {
    const u = new URL(location.href);
    u.searchParams.set('country', country.name);
    history.replaceState({}, '', u.toString());

    const overlay = document.getElementById('detailOverlay');
    const title = document.getElementById('detailTitle');
    let copyBtn = document.getElementById('detailCopy');
    if(!copyBtn){
      copyBtn = document.createElement('button');
      copyBtn.id = 'detailCopy';
      copyBtn.className = 'px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 ml-auto';
      copyBtn.textContent = 'Copy link';
      document.querySelector('#detailOverlay .border-b').appendChild(copyBtn);
      copyBtn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(location.href);
          copyBtn.textContent='Copied!'; setTimeout(()=>copyBtn.textContent='Copy link',1200);
        } catch(e){}
      });
    }

    const body = document.getElementById('detailBody');
    title.textContent = country.name;
    body.innerHTML = '';

    const section = (title, items, key) =>
      h('div', { class: 'space-y-2' }, [
        h('h4', { class: 'text-base font-semibold text-indigo-700' }, [title]),
        ...items.map(i => h('div', { class: 'flex items-center gap-3 p-2 rounded-lg bg-slate-50' }, [
          key !== 'holidays' ? h('img', { src: i.image, alt: i.name, class: 'h-14 w-20 rounded object-cover' }) : '',
          h('span', { class: 'font-medium' }, [i.name || i])
        ]))
      ]);

    body.append(
      section('Holidays', country.holidays.map(hd => ({ name: hd })), 'holidays'),
      section('Foods', country.foods, 'foods'),
      section('Traditional Clothing', country.clothes, 'clothes')
    );

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  }

  function closeDetail() {
    const overlay = document.getElementById('detailOverlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }

  window.addEventListener('DOMContentLoaded', () => {
    const continent = getParam('continent');
    renderGrid(continent);

    const deep = window.GV_openCountryFromQuery && window.GV_openCountryFromQuery();
    if (deep) setTimeout(() => openDetail(deep), 50);

    document.getElementById('detailClose').addEventListener('click', closeDetail);
    document.getElementById('detailOverlay').addEventListener('click', e => {
      if (e.target.id === 'detailOverlay') closeDetail();
    });
  });
})();
