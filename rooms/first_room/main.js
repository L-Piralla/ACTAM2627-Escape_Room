/* =========================================================
   First room – Il laboratorio delle onde: game logic
   ========================================================= */

/* ---------- Config ---------- */
const TYPES = [
  { id: 1, name: 'Sinusoidale',   osc: 'sine',     f: p => Math.sin(p),
    desc: 'Suono purissimo e morbido (flauto, diapason)' },
  { id: 2, name: 'Triangolare',   osc: 'triangle', f: p => 2 / Math.PI * Math.asin(Math.sin(p)),
    desc: 'Morbido ma più cupo e denso (flauto di legno)' },
  { id: 3, name: 'Quadra',        osc: 'square',   f: p => Math.sin(p) >= 0 ? 1 : -1,
    desc: 'Nasale, cavo e sintetico (oboe, clarinetto)' },
  { id: 4, name: 'Dente di sega', osc: 'sawtooth', f: p => { const u = p / (2 * Math.PI); return 2 * (u - Math.floor(u + .5)); },
    desc: 'Aspro e ricco di armonici (archi all\'unisono)' }
];
const CODE_LEN = 3;
const DEFAULT_TRACK_MS = 1650;

// Hook to move on to the next room
window.onRoomComplete = function () { alert('Qui parte la stanza 2!'); };

/* ---------- State ---------- */
let waves = [], code = '', input = '', tries = 0, busy = false;

const $ = id => document.getElementById(id);

/* ---------- Legend ---------- */
function wavePath(f) {
  let d = '';
  for (let x = 0; x <= 60; x++) {
    const y = 12 - 9 * f(2 * Math.PI * 2 * x / 60);
    d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
  }
  return d;
}

function buildLegend() {
  $('legend').innerHTML = TYPES.map(t =>
    `<tr><td class="n">${t.id}</td>
     <td class="w"><svg viewBox="0 0 60 24"><path d="${wavePath(t.f)}"/></svg>${t.name}</td>
     <td class="d">${t.desc}</td></tr>`).join('');
}

/* ---------- Track generation ---------- */
function generate() {
  waves = [...TYPES].sort(() => Math.random() - .5).slice(0, CODE_LEN);   // all different timbres
  code = waves.map(w => w.id).join('');
  input = '';
  tries = 0;

  $('tracks').innerHTML = waves.map((w, i) =>
    `<div class="track" id="t${i}"><span>Traccia ${i + 1}</span>
     <div class="bars"><i></i><i></i><i></i><i></i><i></i></div>
     <button class="play" type="button" aria-label="Ascolta la traccia ${i + 1}" data-i="${i}">
       <svg viewBox="0 0 20 20"><path d="M4 2L18 10L4 18Z"/></svg></button></div>`).join('');
  document.querySelectorAll('.play').forEach(b => b.onclick = () => play(+b.dataset.i));

  $('tries').textContent = 'Tentativi: 0';
  renderDisplay();
  setStatus('');
  // console.log('Code:', code);   // debug
}

/* ---------- Playback (the actual audio lives in audio.js) ---------- */
function setPlayButtons(disabled) {
  document.querySelectorAll('.play').forEach(b => b.disabled = disabled);
}

function play(i) {
  if (busy) return;
  const w = waves[i];
  const ms = window.onPlayTrack({ index: i, id: w.id, type: w.osc }) || DEFAULT_TRACK_MS;
  busy = true;
  $('t' + i).classList.add('on');
  setPlayButtons(true);
  setTimeout(() => {
    busy = false;
    $('t' + i).classList.remove('on');
    setPlayButtons(false);
  }, ms);
}

/* ---------- Keypad ---------- */
function buildPad() {
  const pad = $('pad');
  const keys = [
    ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
    ['Cancella', '⌫', 'wide'], ['Invia', 'OK', 'wide go']
  ];
  keys.forEach(([label, k, cls]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'key ' + (cls || '');
    b.textContent = label;
    b.onclick = () => press(k);
    pad.appendChild(b);
  });
}

function press(k) {
  if (k === '⌫') input = input.slice(0, -1);
  else if (k === 'OK') return submit();
  else if (/^[1-4]$/.test(k) && input.length < CODE_LEN) input += k;
  setStatus('');
  renderDisplay();
}

function renderDisplay() {
  $('display').innerHTML =
    Array.from({ length: CODE_LEN }, (_, i) => `<div class="digit">${input[i] || '–'}</div>`).join('');
}

function setStatus(msg, bad) {
  const s = $('status');
  s.textContent = msg;
  s.className = 'status' + (bad ? ' bad' : '');
}

function submit() {
  if (input.length < CODE_LEN) return setStatus('Inserisci tutte e ' + CODE_LEN + ' le cifre.', true);
  tries++;
  $('tries').textContent = 'Tentativi: ' + tries;

  if (input === code) { $('win').classList.add('show'); return; }

  const lock = $('lock');
  lock.classList.remove('shake');
  void lock.offsetWidth;            // restart the animation
  lock.classList.add('shake');
  setStatus('Stonato! Riascolta le tracce e riprova.', true);
  input = '';
  renderDisplay();
}

/* ---------- Events ---------- */
document.addEventListener('keydown', e => {
  if (/^[1-4]$/.test(e.key)) press(e.key);
  else if (e.key === 'Backspace') press('⌫');
  else if (e.key === 'Enter') press('OK');
});

$('regen').onclick = generate;
$('next').onclick = () => {
  $('win').classList.remove('show');
  window.onRoomComplete();
};

/* ---------- Init ---------- */
buildLegend();
buildPad();
generate();
