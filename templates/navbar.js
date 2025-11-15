class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .navbar {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          box-shadow: 0 4px 20px rgba(79,70,229,.25);
        }
        .nav-link { transition: background-color .2s, transform .2s; }
        .nav-link:hover { background-color: rgba(255,255,255,0.1); transform: translateY(-1px); }
        a { color: inherit; text-decoration: none; }
      </style>
      <nav class="navbar text-white p-4">
        <div class="container mx-auto flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:rgba(255,255,255,.15);">🌍</span>
            <a href="index.html" class="text-2xl font-bold">Global Village</a>
          </div>
          <div class="hidden md:flex space-x-2">
            <a href="index.html" class="nav-link px-3 py-2 rounded-lg">Home</a>
            <a href="countries.html" class="nav-link px-3 py-2 rounded-lg">Countries</a>
            <a href="#" class="nav-link px-3 py-2 rounded-lg">About</a>
          </div>
        </div>
      </nav>`;
  }
}
customElements.define('custom-navbar', CustomNavbar);
