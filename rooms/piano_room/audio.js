/* Il pianista e l'armonia – audio
   Campioni reali di pianoforte (audio/41.wav … 81.wav = note MIDI 41–81).
   "Piano FF" di jobro (freesound.org), licenza CC BY 3.0.
   Serve un server (anche locale): da file:// il browser blocca il caricamento dei .wav. */

let ac = null, mix = null;
const BUF = {};

function ctx(){
  if(!ac){
    ac = new (window.AudioContext||window.webkitAudioContext)();
    const comp = ac.createDynamicsCompressor(); comp.connect(ac.destination);
    mix = ac.createGain(); mix.connect(comp);
    // riverbero di sala
    const len = ac.sampleRate*1.8, ir = ac.createBuffer(2,len,ac.sampleRate);
    for(let c=0;c<2;c++){ const d = ir.getChannelData(c); for(let i=0;i<len;i++) d[i] = (Math.random()*2-1)*Math.pow(1-i/len,3); }
    const cv = ac.createConvolver(), w = ac.createGain(); cv.buffer = ir; w.gain.value = .12;
    mix.connect(cv); cv.connect(w); w.connect(comp);
  }
  ac.resume(); return ac;
}

function loadSamples(){
  const a = ctx();
  for(let m=41;m<=81;m++)
    fetch(`audio/${m}.wav`).then(r => r.arrayBuffer()).then(b => a.decodeAudioData(b)).then(b => BUF[m] = b).catch(() => {});
}

// nota MIDI m: inizio t, tenuta d (s), volume v
function tone(m,t,d,v){
  const b = BUF[m]; if(!b) return;
  const a = ctx(), s = a.createBufferSource(), g = a.createGain(), off = t+d+.05;
  s.buffer = b; g.gain.setValueAtTime(v*3,t); g.gain.setValueAtTime(v*3,off); g.gain.linearRampToValueAtTime(0,off+.3);
  s.connect(g).connect(mix); s.start(t); s.stop(off+.35);
}

// seq: [[nota|[note], inizio(battiti), durata(battiti)], ...] -> durata in ms
function playSeq(seq,beat=.5){
  const t = ctx().currentTime+.05; let end = 0;
  seq.forEach(([m,s,d]) => { const ms = [].concat(m);
    ms.forEach(x => tone(x,t+s*beat,d*beat+.5,.2/Math.sqrt(ms.length))); end = Math.max(end,s+d); });
  return end*beat*1000+500;
}
