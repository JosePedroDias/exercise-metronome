const AudioContext = window.AudioContext || window.webkitAudioContext;

export function metronome(rpm) {
  const audioContext = new AudioContext();

  //const period = 1 / rpm;

  // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator
  const osc = audioContext.createOscillator();
  osc.connect(audioContext.destination);

  osc.frequency.value = 880.0;
  //        osc.frequency.value = 440.0;
  //        osc.frequency.value = 220.0;

  function tick() {
    osc.start(0);
    osc.stop(0 + 0.05);
  }

  return { tick };

  /* osc.onended = function () {
    console.log('Your tone has now stopped playing!');
  }; */
}
