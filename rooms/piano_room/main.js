/* Il pianista e l'armonia – logica di gioco (l'audio è in audio.js) */

let run = 0, busy = false, sndId = 0;   // run: annulla i timer al cambio schermata; busy: un solo suono alla volta

const IMG = { n:'img/pianista_normale.jpg', h:'img/pianista_felice.jpg', s:'img/pianista_triste.jpg' };
const $ = id => document.getElementById(id);
const LV = ['facile','medio','difficile'];
const BARS = '<div class="bars"><i></i><i></i><i></i><i></i><i></i></div>';
window.onRoomComplete = function(){ alert('Qui parte la fase finale della stanza!'); };   // hook
window.onBackConfirmed = function(){};   // hook: per ora non succede nulla

/* ---------- Sfondo a doodle ---------- */
function drawDoodles(){
  const s = $('doodles'), W = innerWidth, H = innerHeight;
  const ids = ['note','vinyl','metro','violin','piano','phones','clef','fork','staff','star','adagio','forte'];
  s.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let out = '', k = 0, cell = 170;
  for(let y=0;y<H+cell;y+=cell) for(let x=0;x<W+cell;x+=cell){
    const id = ids[(k++ * 5 + Math.floor(x/cell)) % ids.length];
    const sz = 0.9 + ((k*37)%7)/12, rot = ((k*53)%50)-25;
    const px = x + ((k*29)%60) - 20 + (Math.floor(y/cell)%2)*cell/2, py = y + ((k*41)%50) - 20;
    out += `<g transform="translate(${px} ${py}) rotate(${rot} 50 50) scale(${sz})" fill="none" stroke="#1b1612" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><use href="#d-${id}"/></g>`;
  }
  s.innerHTML = out;
}
addEventListener('resize', drawDoodles);

// Un solo suono alla volta: finché uno è in riproduzione, gli altri sono bloccati
function sound(seq,beat=.5,el=null,force=false){
  if(busy && !force) return 0;
  const d = playSeq(seq,beat); busy = true; document.documentElement.classList.add('snd'); flash(el,d);
  const r = ++sndId;
  setTimeout(() => { if(r === sndId){ busy = false; document.documentElement.classList.remove('snd'); } }, d);
  return d;
}
function whenFree(f){ const r = run; (function t(){ if(r !== run) return; if(busy) setTimeout(t,250); else f(); })(); }

const NM = m => ['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'][m%12];
const shuffle = a => [...a].sort(() => Math.random()-.5);

/* ---------- Pianista ---------- */
function say(t,m='n'){
  $('say').textContent = t;
  const f = $('face'); f.src = IMG[m];
  f.classList.remove('pop'); void f.offsetWidth; f.classList.add('pop');
}
function act(list){
  $('act').innerHTML = '';
  list.forEach(([l,f]) => { const b = document.createElement('button');
    b.className = 'key go'; b.type = 'button'; b.textContent = l; b.onclick = f; $('act').appendChild(b); });
}
function reset(){ run++; }
function later(f,ms){ const r = run; setTimeout(() => { if(r === run) f(); }, ms); }
function flash(el,ms){ if(!el) return; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), ms); }
function scene(text,btn,next){
  reset(); document.body.className = ''; say(text,'n'); $('game').style.display = 'none'; act([[btn,next]]);
}
function openGame(){ const g = $('game'); g.style.display = 'block'; return g; }

/* ---------- Testi ---------- */
const T0 = "Ciao! Io sono il pianista di questa band e mi occupo di armonizzare la melodia. L'armonia è lo scheletro del brano, è ciò che trasforma una semplice sequenza di note in un'emozione, dando un colore a ogni melodia.";
const T1 = "Sul pianoforte dividiamo i compiti in due: la mano sinistra suona i registri bassi e crea la struttura portante (gli accordi e i bassi di sostegno); la mano destra si muove nei registri acuti e canta la melodia principale. Senza questa divisione, il brano sarebbe o troppo pesante o troppo vuoto!";
const E1 = "Primo gioco! Suonerò un breve brano completo, a due mani. Subito dopo il pezzo si scomporrà in due blocchi sonori: premi ▶ su ciascun blocco per ascoltarlo, poi trascinalo (o toccalo e tocca la mano di destinazione) nella metà corretta. I bassi e la struttura vanno alla mano sinistra, la melodia acuta alla mano destra. Ci sono tre brani, dal più facile al più difficile.";
const T2 = "Perfetto! Ora che sai distinguere tra mano sinistra e destra, passiamo alla base dell'armonia: gli accordi. Un accordo di base è formato da almeno tre note che suonate insieme creano una consonanza perfetta. La radice dà il nome all'accordo, e le altre note definiscono se è un accordo maggiore o minore.";
const E2 = "Secondo gioco: mettiamo alla prova il tuo orecchio armonico! Suonerò un accordo di tre note. Tu avrai a disposizione cinque note: seleziona le tre che, suonate insieme, ricreano l'accordo che hai ascoltato. Puoi riascoltarlo quando vuoi. I livelli sono tre: triade maggiore, minore e aumentata.";
const T3 = "Ottimo orecchio! Ma gli accordi di base a volte sono troppo semplici. È qui che entra in gioco il colore. Aggiungendo note extra (come le settime, le none o le sospensioni), cambiamo totalmente l'atmosfera: possiamo rendere un accordo misterioso, sognante, teso o nostalgico. Tutto questo dà personalità al beat.";
const E3 = "Terzo gioco: dai colore all'accordo! Ti dirò quale atmosfera voglio e ti farò sentire un accordo a cui manca l'ultima nota. Tocca le tre note a disposizione per ascoltarle una alla volta, poi trascina nello spazio vuoto quella che completa l'accordo con il carattere giusto e premi Avanti. Se è corretta, cambierà anche l'atmosfera della stanza!";
const T4 = "Hai completato l'addestramento armonico! Ora la stanza virtuale è pronta. Ascolta il sample originale del pianoforte e ricostruiscilo passo dopo passo: scrivi prima la parte della mano sinistra (la struttura), poi quella della mano destra (la melodia), e uniscile per far partire il beat definitivo della canzone!";

/* ---------- Gioco 1: mano sinistra / destra ---------- */
const PIECES = [
 { beat:.5,   // facile: la sinistra cammina sotto la melodia
   L:[[48,0,1],[55,1,1],[52,2,1],[55,3,1],[43,4,1],[50,5,1],[47,6,1],[50,7,1]],
   R:[[72,0,1],[76,1,1],[79,2,1],[76,3,1],[74,4,1],[71,5,1],[74,6,2]] },
 { beat:.45,  // medio: basso sincopato con salti d'ottava
   L:[[45,0,.75],[57,.75,.25],[52,1,.5],[57,1.5,.5],[41,2,.75],[53,2.75,.25],[48,3,.5],[53,3.5,.5],[48,4,.75],[60,4.75,.25],[55,5,.5],[60,5.5,.5],[43,6,.75],[55,6.75,.25],[50,7,.5],[55,7.5,.5]],
   R:[[76,0,1],[72,1,1],[69,2,1],[72,3,1],[76,4,1],[79,5,1],[74,6,1],[71,7,1]] },
 { beat:.45,  // difficile: la linea di basso scavalca la melodia (note più alte della destra)
   L:[[48,0,.5],[55,.5,.5],[72,1,.5],[76,1.5,.5],[43,2,.5],[50,2.5,.5],[74,3,.5],[79,3.5,.5],[45,4,.5],[52,4.5,.5],[72,5,.5],[76,5.5,.5],[41,6,.5],[48,6.5,.5],[69,7,.5],[77,7.5,.5]],
   R:[[64,0,.5],[67,.5,.5],[65,1,.5],[64,1.5,.5],[62,2,.5],[59,2.5,.5],[62,3,.5],[67,3.5,.5],[64,4,.75],[60,4.75,.25],[62,5,.5],[64,5.5,.5],[65,6,.5],[64,6.5,.5],[62,7,.5],[60,7.5,.5]] }
];
function g1(l){
  reset(); document.body.className = '';
  const P = PIECES[l], beat = P.beat, placed = {L:null,R:null};
  let sel = null, done = false;
  const order = shuffle(['L','R']), nm = {[order[0]]:'A',[order[1]]:'B'};
  say(`Livello ${l+1} (${LV[l]}): ascolta il brano completo, poi assegna ogni blocco alla mano giusta.`);
  act([]);
  const g = openGame();

  function draw(){
    const pool = order.filter(k => placed.L!==k && placed.R!==k);
    const blk = k => `<div class="blk${sel===k?' sel':''}" draggable="${!done}" data-k="${k}"><span>Blocco ${nm[k]}</span>${BARS}<button class="play" type="button" data-p="${k}" aria-label="Ascolta il blocco ${nm[k]}">▶</button></div>`;
    g.innerHTML = `<h2>Brano ${l+1} di 3</h2>
      <div class="track" id="tf"><span>Il brano completo</span>${BARS}<button class="play" type="button" id="pf" aria-label="Ascolta il brano completo">▶</button></div>
      <div class="pool">${pool.map(blk).join('') || '<em class="hint">Tutti i blocchi sono stati posizionati.</em>'}</div>
      <div class="zones">${['L','R'].map(z => `<div class="zone" data-z="${z}"><b>${z==='L'?'Mano sinistra':'Mano destra'}</b>${placed[z]?blk(placed[z]):'<em class="hint">trascina qui un blocco</em>'}</div>`).join('')}</div>
      <div class="tools"><span class="hint">Tocca un blocco già posizionato per rimuoverlo.</span><button class="key go" type="button" id="chk" ${placed.L&&placed.R&&!done?'':'disabled'}>Verifica</button></div>`;
    g.querySelectorAll('[data-p]').forEach(b => b.onclick = e => { e.stopPropagation();
      sound(P[b.dataset.p],beat,b.closest('.blk')); });
    $('pf').onclick = () => sound(P.L.concat(P.R),beat,$('tf'));
    g.querySelectorAll('.blk').forEach(b => { const k = b.dataset.k;
      b.onclick = () => { if(done) return;
        if(placed.L===k) placed.L = null; else if(placed.R===k) placed.R = null; else sel = sel===k ? null : k;
        draw(); };
      b.ondragstart = e => { e.dataTransfer.setData('text',k); sel = null; }; });
    g.querySelectorAll('.zone').forEach(z => {
      const put = k => { if(done || !k) return;
        if(placed.L===k) placed.L = null; if(placed.R===k) placed.R = null;
        placed[z.dataset.z] = k; sel = null; draw(); };
      z.onclick = () => put(sel);
      z.ondragover = e => e.preventDefault();
      z.ondrop = e => { e.preventDefault(); put(e.dataTransfer.getData('text')); };
    });
    $('chk').onclick = check;
  }
  function check(){
    reset();
    if(placed.L==='L' && placed.R==='R'){
      done = true; draw();
      say(['Esatto! I bassi sostengono, la melodia canta. Bel lavoro!','Bravissimo! Hai separato perfettamente struttura e melodia.','Impressionante! Anche con la sinistra che scavalca la destra hai riconosciuto i due ruoli.'][l],'h');
      act([[l<2?'Prossimo brano':'Avanti', () => l<2 ? g1(l+1) : scene(T2,'Avanti',g2Intro)]]);
    } else {
      placed.L = placed.R = null; sel = null; draw();
      say("Non è corretto. Riascolta i blocchi con attenzione e riprova!",'s');
    }
  }
  draw(); whenFree(() => $('pf').click());
}

/* ---------- Gioco 2: accordi di tre note ---------- */
const G2 = [
 { t:'triade maggiore',  n:[60,62,64,66,67], c:[60,64,67] },
 { t:'triade minore',    n:[69,71,72,75,76], c:[69,72,76] },
 { t:'triade aumentata', n:[60,62,64,68,70], c:[60,64,68] }
];
function g2Intro(){ scene(E2,'Inizia il gioco',() => g2(0)); }
function g2(l){
  reset(); document.body.className = '';
  const L = G2[l]; let sel = [], done = false, locked = false;
  say(`Livello ${l+1} (${LV[l]}): ${L.t}. Ascolta l'accordo e seleziona le tre note giuste.`);
  act([]);
  const g = openGame();
  const hear = () => sound([[L.c,0,3]],.5,$('tc'));
  function draw(){
    g.innerHTML = `<h2>Accordo ${l+1} di 3 – ${L.t}</h2>
      <div class="track" id="tc"><span>L'accordo del pianista</span>${BARS}<button class="play" type="button" id="pc" aria-label="Riascolta l'accordo">▶</button></div>
      <div class="notes">${L.n.map(m => `<button class="key nk${sel.includes(m)?' sel':''}" type="button" data-m="${m}" ${locked?'disabled':''}>${NM(m)}</button>`).join('')}</div>
      <div class="status">Note scelte: ${sel.length}/3</div>
      <div class="tools"><span class="hint">Tocca una nota per sentirla e selezionarla.</span><button class="key go" type="button" id="chk" ${sel.length===3&&!done&&!locked?'':'disabled'}>Conferma</button></div>`;
    $('pc').onclick = hear;
    g.querySelectorAll('.nk').forEach(b => b.onclick = () => { if(done || locked) return;
      const m = +b.dataset.m; if(!busy) tone(m,ctx().currentTime+.02,1.5,.2);
      if(sel.includes(m)) sel = sel.filter(x => x!==m); else if(sel.length<3) sel.push(m);
      draw(); });
    $('chk').onclick = check;
  }
  function check(){
    if(locked) return;
    reset(); locked = true;
    const ns = [...sel].sort((x,y) => x-y), ok = ns.join() === [...L.c].sort((x,y) => x-y).join();
    draw();
    say("Ascolto le note che hai scelto: prima una dopo l'altra, poi tutte insieme…");
    // le tre note in ordine (dalla più grave alla più acuta), poi insieme
    const d = sound([[ns[0],0,1],[ns[1],1,1],[ns[2],2,1],[ns,3.5,3]],.5,null,true);
    later(() => {
      if(ok){
        done = true; draw();
        say(`Esatto! Hai riconosciuto la ${L.t}: ${['Do-Mi-Sol, il suono più solare e stabile.','La-Do-Mi, più scura e malinconica.','Do-Mi-Sol#, sospesa e instabile, perché non risolve da nessuna parte.'][l]}`,'h');
        act([[l<2?'Prossimo accordo':'Avanti', () => l<2 ? g2(l+1) : scene(T3,'Avanti',g3Intro)]]);
      } else {
        sel = []; locked = false; draw();
        say("Non è questo l'accordo. Riascolta il suono del pianista con ▶ e riprova a scegliere le tre note.",'s');
      }
    }, d);
  }
  draw(); whenFree(hear);
}

/* ---------- Gioco 3: colore ed emozione ---------- */
const G3 = [
 { m:'gioioso',     cls:'joy',   b:[60,64,67], o:[[72,'Do'],[73,'Do#'],[70,'Sib']],  ok:72,
   w:"Il Do ribadito in alto chiude l'accordo in modo pieno e luminoso: ecco la gioia!" },
 { m:'malinconico', cls:'mel',   b:[55,59,62], o:[[67,'Sol'],[66,'Fa#'],[68,'Sol#']], ok:66,
   w:"Il Fa# aggiunge una settima maggiore: un colore dolce e nostalgico, un po' sognante." },
 { m:'spaventoso',  cls:'scary', b:[62,65,69], o:[[73,'Do#'],[74,'Re'],[72,'Do']],    ok:73,
   w:"Il Do# su un accordo minore crea una tensione inquietante, da colonna sonora da brivido!" }
];
function g3Intro(){ scene(E3,'Inizia il gioco',() => g3(0)); }
function g3(l){
  reset(); document.body.className = '';
  const L = G3[l], opts = shuffle(L.o), wrong = []; let placed = null, sel = null, done = false;
  say(`Voglio un'atmosfera ${L.m}! Ascolta le prime tre note, poi prova le note a disposizione e trascina nello spazio vuoto quella che completa l'accordo.`);
  act([]);
  const g = openGame();
  const hear = () => sound([[L.b,0,3]],.5,$('tc'));
  const nm = m => L.o.find(o => o[0]===m)[1];
  function draw(){
    const free = opts.filter(([m]) => m !== placed);
    g.innerHTML = `<h2>Atmosfera ${l+1} di 3 – ${L.m}</h2>
      <div class="track" id="tc"><span>Le prime tre note</span>${BARS}<button class="play" type="button" id="pc" aria-label="Ascolta le prime tre note">▶</button></div>
      <div class="slots">${L.b.map(m => `<div class="slot">${NM(m)}</div>`).join('')}<div class="slot${placed?'':' q'}" id="sl">${placed?nm(placed):'?'}</div></div>
      <div class="notes">${free.map(([m,n]) => { const x = done || wrong.includes(m);
        return `<button class="key nk${sel===m?' sel':''}${wrong.includes(m)?' bad':''}" type="button" draggable="${!x}" data-m="${m}" ${x?'disabled':''}>${n}</button>`; }).join('')}</div>
      <div class="tools"><span class="hint">Tocca una nota per ascoltarla, poi trascinala (o toccala) nello spazio vuoto e premi Avanti.</span><button class="key go" type="button" id="chk" ${placed&&!done?'':'disabled'}>Avanti</button></div>`;
    $('pc').onclick = hear;
    g.querySelectorAll('.nk').forEach(b => { const m = +b.dataset.m;
      b.onclick = () => { sel = sel===m ? null : m; sound([[m,0,3]]); draw(); };
      b.ondragstart = e => e.dataTransfer.setData('text',m); });
    const sl = $('sl'), put = m => { if(done || !m) return; placed = m; sel = null; draw(); };
    sl.onclick = () => { if(done) return; if(sel) put(sel); else if(placed){ placed = null; draw(); } };
    sl.ondragover = e => e.preventDefault();
    sl.ondrop = e => { e.preventDefault(); put(+e.dataTransfer.getData('text')); };
    $('chk').onclick = check;
  }
  function check(){
    if(busy || !placed) return;
    reset(); const m = placed;
    if(m === L.ok){
      done = true; draw(); sound([[L.b.concat(m),0,3]],.5,null,true); document.body.className = L.cls;
      say(`Perfetto! ${L.w}`,'h');
      act([[l<2?'Prossima atmosfera':'Avanti', () => l<2 ? g3(l+1) : scene(T4,'Continua',() => window.onRoomComplete())]]);
    } else {
      wrong.push(m); placed = null; draw(); sound([[L.b.concat(m),0,3]],.5,null,true);
      say("Non è la nota giusta per questa atmosfera: l'hai appena sentito nell'accordo. Scegline un'altra!",'s');
    }
  }
  draw(); whenFree(hear);
}

/* ---------- Pulsante Indietro ---------- */
$('back').onclick = () => $('ask').classList.add('show');
$('no').onclick = () => $('ask').classList.remove('show');
$('yes').onclick = () => { $('ask').classList.remove('show'); window.onBackConfirmed(); };

/* ---------- Avvio ---------- */
loadSamples(); drawDoodles();
scene(T0,'Avanti',() => scene(T1,'Avanti',() => scene(E1,'Inizia il gioco',() => g1(0))));
