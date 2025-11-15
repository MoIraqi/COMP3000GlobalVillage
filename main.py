# This cell writes updated frontend files and a new FastAPI `main.py` that serves an API
# to fetch all countries (via restcountries.com), supports search, region filter, and pagination,
# and serves static frontend files.

from pathlib import Path
import json, textwrap

base = Path("/mnt/data")
(base / "components").mkdir(parents = True, exist_ok = True)

# Updated index.html with a search bar and "Load more" button
index_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Culture Compass</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
    <script src="https://unpkg.com/feather-icons"></script>
    <script src="components/navbar.js"></script>
    <script src="components/culture-card.js"></script>
    <script src="components/filter-sidebar.js"></script>
</head>
<body class="bg-gray-50">
    <custom-navbar></custom-navbar>

    <div class="flex flex-col md:flex-row min-h-screen">
        <custom-filter-sidebar></custom-filter-sidebar>

        <main class="flex-1 p-6">
            <div class="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <h1 class="text-4xl font-bold text-gray-800 mb-2">Explore Global Cultures</h1>
                    <p class="text-gray-600">Discover traditions, foods, music, and more from around the world</p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="relative">
                        <input id="search-input" type="text" placeholder="Search countries…"
                            class="w-72 border border-gray-300 rounded-xl py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-indigo-500">
                        <i data-feather="search" class="absolute left-3 top-2.5 text-gray-400"></i>
                    </div>
                    <button id="clear-search" class="hidden px-3 py-2 rounded-lg border text-sm">Clear</button>
                </div>
            </div>

            <div id="status-bar" class="text-sm text-gray-500 mb-3"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="culture-grid">
                <!-- Culture cards will be inserted here by JavaScript -->
            </div>

            <div class="flex justify-center my-10">
                <button id="load-more" class="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow hidden">
                    Load more
                </button>
            </div>
        </main>
    </div>

    <script src="script.js"></script>
    <script>
        feather.replace();
        document.addEventListener('DOMContentLoaded', () => {
            initCultureGrid();
        });
    </script>
</body>
</html>
"""
(base / "index.html").write_text(index_html, encoding = "utf-8")

# Keep existing style.css if present, else write a minimal one
style_css = """@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

body { font-family: 'Poppins', sans-serif; }

.culture-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.culture-card { transition: all 0.3s ease; }

.filter-option:hover { background-color: rgba(59, 130, 246, 0.1); }

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.culture-card { animation: fadeIn 0.4s ease forwards; }
"""
(base / "style.css").write_text(style_css, encoding = "utf-8")

# Updated culture-card.js: same interface, but shows flag + some meta
culture_card_js = """class CustomCultureCard extends HTMLElement {
    connectedCallback() {
        const culture = JSON.parse(this.getAttribute('data-culture'));

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .card-image {
                    height: 160px;
                    background-size: cover;
                    background-position: center;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background-color: #e0e7ff;
                    color: #4f46e5;
                }
                .detail-item { margin-bottom: 8px; }
                .detail-title { font-weight: 600; color: #4f46e5; margin-right: 4px; }
                .grow { flex: 1; }
            </style>
            <div class="card culture-card">
                <div class="card-image" style="background-image: url('${culture.image}')"></div>
                <div class="p-5 grow">
                    <div class="flex justify-between items-start mb-3">
                        <h2 class="text-xl font-bold text-gray-800">${culture.name}</h2>
                        <span class="badge">${culture.region}</span>
                    </div>
                    <div class="detail-item"><span class="detail-title">Capital:</span><span>${culture.capital ?? '—'}</span></div>
                    <div class="detail-item"><span class="detail-title">Population:</span><span>${culture.population?.toLocaleString?.() ?? '—'}</span></div>
                    <div class="detail-item"><span class="detail-title">Foods:</span><span>${(culture.foods||[]).join(', ')}</span></div>
                    <div class="detail-item"><span class="detail-title">Holidays:</span><span>${(culture.holidays||[]).join(', ')}</span></div>
                </div>
                <div class="px-5 pb-4 flex justify-between">
                    <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(culture.name)}" target="_blank" class="text-blue-500 hover:underline">Learn More</a>
                    <div class="flex space-x-2">
                        <i data-feather="heart" class="text-gray-400"></i>
                        <i data-feather="share-2" class="text-gray-400"></i>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('custom-culture-card', CustomCultureCard);"""
(base / "components" / "culture-card.js").write_text(culture_card_js, encoding = "utf-8")

# Keep navbar and filter sidebar similar to user's versions
navbar_js = """class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .navbar { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .nav-link:hover { background-color: rgba(255, 255, 255, 0.1); }
            </style>
            <nav class="navbar text-white p-4">
                <div class="container mx-auto flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <i data-feather="globe"></i>
                        <a href="#" class="text-2xl font-bold">Culture Compass</a>
                    </div>
                    <div class="hidden md:flex space-x-6">
                        <a href="#" class="nav-link px-3 py-2 rounded-lg">Home</a>
                        <a href="#" class="nav-link px-3 py-2 rounded-lg">About</a>
                        <a href="#" class="nav-link px-3 py-2 rounded-lg">Contact</a>
                    </div>
                    <button class="md:hidden">
                        <i data-feather="menu"></i>
                    </button>
                </div>
            </nav>
        `;
    }
}
customElements.define('custom-navbar', CustomNavbar);"""
(base / "components" / "navbar.js").write_text(navbar_js, encoding = "utf-8")

filter_sidebar_js = """class CustomFilterSidebar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .sidebar { width: 280px; background: white; box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05); }
                .filter-option { padding: 10px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
                .filter-option.active { background-color: #e0e7ff; color: #4f46e5; font-weight: 500; }
                .filter-section { margin-bottom: 24px; }
                .filter-title { font-weight: 600; color: #4f46e5; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
            </style>
            <div class="sidebar p-6 hidden md:block">
                <h3 class="text-xl font-bold mb-6 text-gray-800">Filter Cultures</h3>

                <div class="filter-section">
                    <h4 class="filter-title">Regions</h4>
                    <div class="space-y-2">
                        <div class="filter-option" data-region="Africa">Africa</div>
                        <div class="filter-option" data-region="Americas">Americas</div>
                        <div class="filter-option" data-region="Asia">Asia</div>
                        <div class="filter-option" data-region="Europe">Europe</div>
                        <div class="filter-option" data-region="Oceania">Oceania</div>
                        <div class="filter-option" data-region="">All Regions</div>
                    </div>
                </div>

                <div class="filter-section">
                    <h4 class="filter-title">Categories</h4>
                    <div class="space-y-2">
                        <div class="filter-option">Food</div>
                        <div class="filter-option">Music</div>
                        <div class="filter-option">Clothing</div>
                        <div class="filter-option">Traditions</div>
                        <div class="filter-option">Holidays</div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            const options = this.shadowRoot.querySelectorAll('.filter-option[data-region]');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    options.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    const region = option.getAttribute('data-region');
                    const event = new CustomEvent('filterChange', { detail: { region } });
                    document.dispatchEvent(event);
                });
            });
        }, 0);
    }
}
customElements.define('custom-filter-sidebar', CustomFilterSidebar);"""
(base / "components" / "filter-sidebar.js").write_text(filter_sidebar_js, encoding = "utf-8")

# New script.js that calls the backend API with pagination and search
script_js = """let current = {
  page: 1,
  pageSize: 30,
  region: '',
  q: '',
  loading: false,
  exhausted: false
};

function status(text) {
  const bar = document.getElementById('status-bar');
  bar.textContent = text || '';
}

async function fetchCountries({ page, pageSize, region, q }) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('page_size', pageSize);
  if (region) params.set('region', region);
  if (q) params.set('q', q);
  const url = `/api/countries?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch countries');
  return res.json();
}

function renderCountries(items) {
  const grid = document.getElementById('culture-grid');
  items.forEach(culture => {
    const card = document.createElement('custom-culture-card');
    card.setAttribute('data-culture', JSON.stringify(culture));
    grid.appendChild(card);
  });
  feather.replace();
}

async function loadMore() {
  if (current.loading || current.exhausted) return;
  current.loading = true;
  status('Loading…');
  try {
    const data = await fetchCountries(current);
    renderCountries(data.items);
    current.exhausted = data.items.length < current.pageSize;
    document.getElementById('load-more').classList.toggle('hidden', current.exhausted);
    if (!current.exhausted) current.page += 1;
    status(`Showing ${document.querySelectorAll('custom-culture-card').length} of ${data.total} countries`);
  } catch (e) {
    console.error(e);
    status('Error loading countries.');
  } finally {
    current.loading = false;
  }
}

function resetGrid() {
  document.getElementById('culture-grid').innerHTML = '';
  current.page = 1;
  current.exhausted = false;
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export async function initCultureGrid() {
  const loadBtn = document.getElementById('load-more');
  loadBtn.addEventListener('click', loadMore);

  // Search
  const search = document.getElementById('search-input');
  const clear = document.getElementById('clear-search');
  const onSearch = debounce(() => {
    current.q = search.value.trim();
    clear.classList.toggle('hidden', !current.q);
    resetGrid();
    loadMore();
  }, 350);
  search.addEventListener('input', onSearch);
  clear.addEventListener('click', () => {
    search.value = '';
    current.q = '';
    clear.classList.add('hidden');
    resetGrid();
    loadMore();
  });

  // Region filter
  document.addEventListener('filterChange', (e) => {
    current.region = e.detail.region || '';
    resetGrid();
    loadMore();
  });

  // Initial load
  resetGrid();
  loadMore();
}"""
(base / "script.js").write_text(script_js, encoding = "utf-8")

# New FastAPI backend: main.py
main_py = '''from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import time
import requests
import os

app = FastAPI(title="Culture Compass API")

# CORS for local dev / simple deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (frontend) if running locally: uvicorn main:app --reload
static_dir = os.getenv("STATIC_DIR", ".")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# Simple in-memory cache
_CACHE: Dict[str, Any] = {"at": 0, "data": []}
_TTL = 60 * 60 * 24  # 24h

# Lightweight cultural placeholders by region (to avoid empty cards)
REGIONAL_DEFAULTS = {
    "Africa": {
        "foods": ["Couscous", "Jollof (varies)"],
        "holidays": ["Independence Day"],
        "music": ["Highlife", "Afrobeat"],
        "clothes": ["Traditional dress"],
        "traditions": ["Market day"],
    },
    "Americas": {
        "foods": ["Empanadas", "BBQ"],
        "holidays": ["Independence Day"],
        "music": ["Folk", "Pop"],
        "clothes": ["Traditional dress"],
        "traditions": ["Carnival/Festivals"],
    },
    "Asia": {
        "foods": ["Rice dishes", "Noodles"],
        "holidays": ["New Year"],
        "music": ["Classical/folk"],
        "clothes": ["National dress"],
        "traditions": ["Tea/Ceremonies"],
    },
    "Europe": {
        "foods": ["Bread & cheese"],
        "holidays": ["National Day"],
        "music": ["Folk", "Classical"],
        "clothes": ["Traditional dress"],
        "traditions": ["Seasonal festivals"],
    },
    "Oceania": {
        "foods": ["Seafood"],
        "holidays": ["National Day"],
        "music": ["Folk"],
        "clothes": ["Traditional dress"],
        "traditions": ["Cultural festivals"],
    },
}

class Culture(BaseModel):
    id: int
    name: str
    region: str
    image: str
    capital: Optional[str]
    population: Optional[int]
    foods: List[str] = []
    holidays: List[str] = []
    music: List[str] = []
    clothes: List[str] = []
    traditions: List[str] = []

class Paged(BaseModel):
    total: int
    items: List[Culture]

def _fetch_all_countries() -> List[Dict[str, Any]]:
    now = time.time()
    if _CACHE["data"] and now - _CACHE["at"] < _TTL:
        return _CACHE["data"]
    resp = requests.get("https://restcountries.com/v3.1/all", timeout=30)
    resp.raise_for_status()
    raw = resp.json()
    # Normalize to Culture-like dicts
    items = []
    for idx, c in enumerate(sorted(raw, key=lambda x: x.get("name", {}).get("common", ""))):
        name = c.get("name", {}).get("common", "Unknown")
        region = c.get("region") or "Unknown"
        defaults = REGIONAL_DEFAULTS.get(region, {"foods": [], "holidays": [], "music": [], "clothes": [], "traditions": []})
        item = {
            "id": idx + 1,
            "name": name,
            "region": region,
            "image": (c.get("flags", {}) or {}).get("png") or (c.get("flags", {}) or {}).get("svg") or "https://placehold.co/400x200",
            "capital": (c.get("capital") or [None])[0],
            "population": c.get("population"),
            "foods": defaults["foods"],
            "holidays": defaults["holidays"],
            "music": defaults["music"],
            "clothes": defaults["clothes"],
            "traditions": defaults["traditions"],
        }
        items.append(item)
    _CACHE["data"] = items
    _CACHE["at"] = now
    return items

@app.get("/api/countries", response_model=Paged)
def list_countries(
    q: Optional[str] = Query(default=None, description="Search by country name"),
    region: Optional[str] = Query(default=None, description="Filter by region (Africa, Americas, Asia, Europe, Oceania)"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=30, ge=1, le=100),
):
    items = _fetch_all_countries()
    if region:
        items = [i for i in items if i["region"].lower() == region.lower()]
    if q:
        ql = q.lower()
        items = [i for i in items if ql in i["name"].lower()]
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return {"total": total, "items": items[start:end]}

@app.get("/api/country/{name}", response_model=Culture)
def country_detail(name: str):
    items = _fetch_all_countries()
    for i in items:
        if i["name"].lower() == name.lower():
            return i
    # naive fallback: first partial match
    for i in items:
        if name.lower() in i["name"].lower():
            return i
    # not found
    return Culture(
        id=0, name=name, region="Unknown", image="https://placehold.co/400x200",
        capital=None, population=None, foods=[], holidays=[], music=[], clothes=[], traditions=[]
    )
'''
(base / "main.py").write_text(main_py, encoding = "utf-8")

# Provide a quick README snippet for running
readme = """# Culture Compass – API Version

## Run the backend (FastAPI)
```bash
pip install fastapi uvicorn requests
uvicorn main:app --reload
