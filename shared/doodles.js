/* =========================================================
   Doodle background (shared by every room)
   Requires in the page: <svg id="doodles" aria-hidden="true"></svg>
   The drawing library (SVG sprite) is injected automatically.
   ========================================================= */
(function () {
  const SPRITE = `
    <g id="d-sine"><path d="M2 50H98" stroke-dasharray="2 6"/><path d="M2 50C14 8 38 8 50 50C62 92 86 92 98 50"/></g>
    <g id="d-square"><path d="M2 50H98" stroke-dasharray="2 6"/><path d="M4 72V28H30V72H56V28H82V72H96"/></g>
    <g id="d-saw"><path d="M2 50H98" stroke-dasharray="2 6"/><path d="M4 72L30 28V72L56 28V72L82 28V72"/></g>
    <g id="d-tri"><path d="M2 50H98" stroke-dasharray="2 6"/><path d="M4 50L19 24L49 76L79 24L96 50"/></g>
    <g id="d-scope"><rect x="6" y="14" width="88" height="66" rx="8"/><rect x="14" y="22" width="52" height="46" rx="3"/><path d="M16 45C24 26 34 26 40 45C46 64 56 64 64 45"/><circle cx="80" cy="32" r="6"/><circle cx="80" cy="52" r="6"/><path d="M30 80V90M70 80V90M22 90H78"/></g>
    <g id="d-speaker"><path d="M8 38H26L48 20V80L26 62H8Z"/><path d="M60 36Q70 50 60 64M70 26Q90 50 70 74M80 16Q108 50 80 84"/></g>
    <g id="d-spectrum"><rect x="8" y="52" width="12" height="38"/><rect x="24" y="24" width="12" height="66"/><rect x="40" y="38" width="12" height="52"/><rect x="56" y="10" width="12" height="80"/><rect x="72" y="46" width="12" height="44"/></g>
    <g id="d-fork"><path d="M38 8V48C38 66 62 66 62 48V8M50 62V92"/><path d="M26 28Q20 38 26 48M74 28Q80 38 74 48M16 22Q6 38 16 54M84 22Q94 38 84 54"/></g>
    <g id="d-mic"><rect x="36" y="6" width="28" height="46" rx="14"/><path d="M26 40Q26 68 50 68Q74 68 74 40M50 68V88M34 90H66M36 22H64M36 34H64"/></g>
    <g id="d-antenna"><path d="M50 92V42"/><circle cx="50" cy="34" r="6"/><path d="M34 22Q26 34 34 46M66 22Q74 34 66 46M22 12Q8 34 22 56M78 12Q92 34 78 56"/></g>
    <g id="d-eq"><path d="M20 10V90M50 10V90M80 10V90"/><rect x="11" y="56" width="18" height="10" rx="2"/><rect x="41" y="24" width="18" height="10" rx="2"/><rect x="71" y="44" width="18" height="10" rx="2"/></g>
    <g id="d-note"><ellipse cx="30" cy="76" rx="11" ry="8" transform="rotate(-20 30 76)"/><ellipse cx="72" cy="68" rx="11" ry="8" transform="rotate(-20 72 68)"/><path d="M40 72V22L82 14V64M40 36L82 28"/></g>
    <g id="d-phones"><path d="M18 62V50A32 32 0 0 1 82 50V62"/><rect x="10" y="58" width="16" height="26" rx="6"/><rect x="74" y="58" width="16" height="26" rx="6"/></g>
    <g id="d-vinyl"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="31"/><circle cx="50" cy="50" r="14"/><circle cx="50" cy="50" r="2"/><path d="M22 28A34 34 0 0 1 40 17"/></g>
    <g id="d-clef"><path d="M54 6V88"/><path d="M54 14C40 28 40 50 52 62C64 74 60 92 46 90C34 88 34 76 46 76C58 76 62 62 50 52C36 42 36 28 50 22"/></g>
    <g id="d-hz"><text x="2" y="60" font-family="Georgia,serif" font-style="italic" font-size="34" stroke="none" fill="#1b1612">440 Hz</text></g>
    <g id="d-freq"><text x="6" y="60" font-family="Georgia,serif" font-style="italic" font-size="34" stroke="none" fill="#1b1612">f = 1/T</text></g>
    <g id="d-lambda"><text x="22" y="72" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="64" stroke="none" fill="#1b1612">λ</text></g>
    <g id="d-star"><path d="M50 14L55 44L86 50L55 56L50 86L45 56L14 50L45 44Z"/></g>`;

  const IDS = ['sine', 'scope', 'note', 'square', 'speaker', 'hz', 'spectrum', 'saw', 'mic', 'clef',
               'tri', 'antenna', 'freq', 'phones', 'eq', 'fork', 'vinyl', 'lambda', 'star'];
  const CELL = 170;

  function injectSprite() {
    const lib = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lib.setAttribute('width', '0');
    lib.setAttribute('height', '0');
    lib.setAttribute('aria-hidden', 'true');
    lib.style.position = 'absolute';
    lib.innerHTML = `<defs>${SPRITE}</defs>`;
    document.body.prepend(lib);
  }

  function draw() {
    const s = document.getElementById('doodles');
    if (!s) return;
    const W = innerWidth, H = innerHeight;
    s.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let out = '', k = 0;
    for (let y = 0; y < H + CELL; y += CELL) {
      for (let x = 0; x < W + CELL; x += CELL) {
        const id = IDS[(k++ * 5 + Math.floor(x / CELL)) % IDS.length];
        const sz = 0.9 + ((k * 37) % 7) / 12;
        const rot = ((k * 53) % 50) - 25;
        const px = x + ((k * 29) % 60) - 20 + (Math.floor(y / CELL) % 2) * CELL / 2;
        const py = y + ((k * 41) % 50) - 20;
        out += `<g transform="translate(${px} ${py}) rotate(${rot} 50 50) scale(${sz})" fill="none" stroke="#1b1612" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><use href="#d-${id}"/></g>`;
      }
    }
    s.innerHTML = out;
  }

  injectSprite();
  draw();
  addEventListener('resize', draw);
})();
