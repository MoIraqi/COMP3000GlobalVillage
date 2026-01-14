class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    const isActive = (file) => current === file;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }

        /* Sticky top bar */
        .wrap{
          position: sticky;
          top: 0;
          z-index: 999;
        }

        /* Background */
        .bar{
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #ec4899 120%);
          box-shadow: 0 10px 30px rgba(15, 23, 42, .18);
        }

        /* Glass layer */
        .glass{
          background: rgba(255,255,255,.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,.15);
        }

        .container{
          max-width: 1100px;
          margin: 0 auto;
          padding: 14px 18px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 14px;
        }

        .brand{
          display:flex;
          align-items:center;
          gap: 10px;
          text-decoration:none;
          color: #fff;
          min-width: 180px;
        }

        .logo{
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display:flex;
          align-items:center;
          justify-content:center;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.25);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
          font-size: 18px;
        }

        .title{
          font-size: 18px;
          font-weight: 700;
          letter-spacing: .2px;
          line-height: 1;
        }
        .subtitle{
          font-size: 12px;
          opacity: .85;
          line-height: 1.1;
        }

        /* Desktop nav */
        .nav{
          display:flex;
          align-items:center;
          gap: 8px;
        }

        .link{
          position: relative;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding: 9px 12px;
          border-radius: 12px;
          color: rgba(255,255,255,.92);
          text-decoration:none;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: .2px;
          transition: transform 140ms ease, background 140ms ease, box-shadow 140ms ease, color 140ms ease;
          outline: none;
          white-space: nowrap;
        }

        .link:hover{
          background: rgba(255,255,255,.14);
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(15, 23, 42, .18);
        }

        .link:active{
          transform: translateY(0px) scale(.99);
        }

        /* Active page pill */
        .link.active{
          background: rgba(255,255,255,.20);
          border: 1px solid rgba(255,255,255,.22);
          color: #fff;
        }

        /* Cute underline accent for active */
        .link.active::after{
          content:"";
          position:absolute;
          left: 14px;
          right: 14px;
          bottom: 6px;
          height: 2px;
          border-radius: 999px;
          background: rgba(255,255,255,.85);
          opacity: .9;
        }

        /* Mobile menu button */
        .menuBtn{
          display:none;
          align-items:center;
          justify-content:center;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.22);
          background: rgba(255,255,255,.12);
          color: #fff;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease;
        }
        .menuBtn:hover{ background: rgba(255,255,255,.18); transform: translateY(-1px); }
        .menuBtn:active{ transform: translateY(0px) scale(.99); }

        /* Mobile dropdown */
        .mobilePanel{
          display:none;
          padding: 0 18px 16px;
        }
        .mobileInner{
          max-width: 1100px;
          margin: 0 auto;
          border-radius: 18px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          overflow:hidden;
          box-shadow: 0 18px 30px rgba(15,23,42,.18);
        }
        .mobileLinks{
          display:grid;
          gap: 6px;
          padding: 12px;
        }
        .mobileLinks .link{
          justify-content:flex-start;
          width: 100%;
          padding: 12px 12px;
          border-radius: 14px;
          font-size: 14px;
        }
        .mobileLinks .link.active::after{ left: 12px; right: 12px; bottom: 8px; }

        /* Responsive */
        @media (max-width: 760px){
          .nav{ display:none; }
          .menuBtn{ display:inline-flex; }
          .brand{ min-width: auto; }
          .title{ font-size: 16px; }
        }

        /* Open state */
        .open .mobilePanel{ display:block; }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce){
          .link, .menuBtn{ transition:none !important; }
        }
      </style>

      <div class="wrap">
        <div class="bar">
          <div class="glass">
            <div class="container">
              <a class="brand" href="index.html" aria-label="Global Village home">
                <span class="logo">🌍</span>
                <div>
                  <div class="title">Global Village</div>
                  <div class="subtitle">Explore cultures worldwide</div>
                </div>
              </a>

              <nav class="nav" aria-label="Main navigation">
                <a class="link ${isActive("index.html") ? "active" : ""}" href="index.html">Home</a>
                <a class="link ${isActive("countries.html") ? "active" : ""}" href="countries.html">Countries</a>
                <a class="link ${isActive("guess-the-flag.html") ? "active" : ""}" href="guess-the-flag.html">Guess The Flag</a>
                <a class="link ${isActive("about.html") ? "active" : ""}" href="about.html">About</a>
              </nav>

              <button class="menuBtn" id="menuBtn" aria-label="Open menu" aria-expanded="false">
                ☰
              </button>
            </div>

            <div class="mobilePanel" id="mobilePanel">
              <div class="mobileInner">
                <div class="mobileLinks" aria-label="Mobile navigation">
                  <a class="link ${isActive("index.html") ? "active" : ""}" href="index.html">Home</a>
                  <a class="link ${isActive("countries.html") ? "active" : ""}" href="countries.html">Countries</a>
                  <a class="link ${isActive("guess-the-flag.html") ? "active" : ""}" href="guess-the-flag.html">Guess The Flag</a>
                  <a class="link ${isActive("about.html") ? "active" : ""}" href="about.html">About</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    const wrap = this.shadowRoot.querySelector(".wrap");
    const btn = this.shadowRoot.getElementById("menuBtn");

    const closeMenu = () => {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "☰";
    };

    const toggleMenu = () => {
      const open = wrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "×" : "☰";
    };

    btn.addEventListener("click", toggleMenu);

    // Close menu when clicking a link
    this.shadowRoot.querySelectorAll(".mobileLinks a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    // Close on ESC
    this.shadowRoot.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });


    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }
}

customElements.define("custom-navbar", CustomNavbar);
