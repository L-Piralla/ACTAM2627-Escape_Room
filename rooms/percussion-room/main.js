/* =========================================================
   Template room – game logic
   Copy the whole folder to start a new room.
   ========================================================= */

/* ---------- Config ---------- */
// TODO: room constants (solution, puzzle data, ...)

// Hook to move on to the next room
window.onRoomComplete = function () { alert('Qui parte la stanza successiva!'); };

/* ---------- State ---------- */
let solved = false;

const $ = id => document.getElementById(id);

/* ---------- Helpers ---------- */
function setStatus(msg, bad) {
  const s = $('status');
  s.textContent = msg;
  s.className = 'status' + (bad ? ' bad' : '');
}

// Shake a box to signal a wrong answer
function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;            // restart the animation
  el.classList.add('shake');
}

// Call this when the player solves the room
function winRoom() {
  solved = true;
  $('win').classList.add('show');
}

/* ---------- Puzzle ---------- */
function buildPuzzle() {
  // TODO: build the room's interactive content inside #puzzle-area
}

/* ---------- Events ---------- */
$('next').onclick = () => {
  $('win').classList.remove('show');
  window.onRoomComplete();
};

/* ---------- Init ---------- */
buildPuzzle();
