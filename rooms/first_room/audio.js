/* =========================================================
   First room – Audio
   This file belongs to whoever handles the audio.

   window.onPlayTrack is called when the player presses play.
   It receives { index, id, type }  with type = 'sine' | 'triangle' | 'square' | 'sawtooth'
   and may return the sound duration in ms (default 1650),
   used to sync the equalizer animation.
   ========================================================= */
window.onPlayTrack = function (track) {
  return 1650;
};
