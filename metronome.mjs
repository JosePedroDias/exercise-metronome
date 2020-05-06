const AudioContext = window.AudioContext || window.webkitAudioContext;

const audioContext = new AudioContext();

const period = 1 / 23;

// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator
const osc = audioContext.createOscillator();
osc.connect(audioContext.destination);

osc.frequency.value = 880.0;
//        osc.frequency.value = 440.0;
//        osc.frequency.value = 220.0;

osc.start(time);
osc.stop(time + noteLength);

oscillator.onended = function () {
  console.log('Your tone has now stopped playing!');
};
