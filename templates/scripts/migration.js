// scripts/migration.js
// Automatically merge legacy culture-card data into GV_COUNTRIES
(function(){
  function normaliseCountryName(s){ return (s||'').trim(); }
  function keyOf(c){ return `${c.name}|${c.continent}`.toLowerCase(); }

  function dedupeMerge(baseArr, addArr){
    const seen = new Set(baseArr.map(keyOf));
    addArr.forEach(c => { if (!seen.has(keyOf(c))) baseArr.push(c); });
  }

  function adaptLegacyCard(card){
    // Attempts to map common legacy keys into the new schema
    return {
      name: normaliseCountryName(card.name),
      continent: card.continent,
      code: card.code || (card.name || '').slice(0,2).toLowerCase(),
      flag: card.flag || card.flagUrl,
      holidays: Array.isArray(card.holidays) ? card.holidays : [],
      foods: (card.foods || []).map(f => ({
        name: f?.name ?? String(f),
        image: f?.image || f?.url || ''
      })),
      clothes: (card.clothes || []).map(c => ({
        name: c?.name ?? String(c),
        image: c?.image || c?.url || ''
      }))
    };
  }

  function migrate(){
    if (!window.GV_COUNTRIES) window.GV_COUNTRIES = [];
    if (Array.isArray(window.CULTURE_CARDS)) {
      try {
        const adapted = window.CULTURE_CARDS
          .filter(Boolean)
          .map(adaptLegacyCard)
          .filter(c => c.name && c.continent);
        dedupeMerge(window.GV_COUNTRIES, adapted);
        console.info(`[GV] Migrated ${adapted.length} legacy culture cards.`);
      } catch (e) {
        console.warn('[GV] Legacy migration failed:', e);
      }
    }
  }

  // Public hook for custom legacy formats:
  // Example:
  // window.registerLegacyCards(() => [{ name, continent, code, flag, holidays, foods, clothes }])
  window.registerLegacyCards = function(getter){
    if (!window.GV_COUNTRIES) window.GV_COUNTRIES = [];
    try {
      const incoming = getter();
      if (Array.isArray(incoming)) {
        const cleaned = incoming.filter(c => c && c.name && c.continent);
        dedupeMerge(window.GV_COUNTRIES, cleaned);
        console.info(`[GV] Registered ${cleaned.length} custom legacy cards.`);
      } else {
        console.warn('[GV] registerLegacyCards expected an array from getter().');
      }
    } catch(e){
      console.warn('[GV] registerLegacyCards failed:', e);
    }
  };

  // Deep-link helper for countries.html?country=Name
  window.GV_openCountryFromQuery = function() {
    try {
      const params = new URL(location.href).searchParams;
      const name = params.get('country');
      if (!name) return null;
      const list = window.GV_COUNTRIES || [];
      return list.find(c => (c.name||'').toLowerCase() === name.toLowerCase()) || null;
    } catch {
      return null;
    }
  };

  // Run on load
  migrate();
})();
