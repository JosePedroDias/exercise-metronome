let audioContext;
let timerWorker;
let unlocked = false;
let isPlaying = false;
let tempo;
let lookahead = 25.0;
let index = 0;
let frequencies = [440, 880];
let nextNoteTime = 0.0;

const scheduleAheadTime = 0.1;
const noteLength = 0.05;

function nextNote() {
  const secondsPerBeat = 60.0 / tempo; // (tempo ? tempo : 0.0000000000000001);
  nextNoteTime += secondsPerBeat;
}

function scheduleNote(beatNumber, time) {
  var osc = audioContext.createOscillator();
  osc.connect(audioContext.destination);
  const freq = frequencies[beatNumber % frequencies.length];
  osc.frequency.value = freq;

  osc.start(time);
  osc.stop(time + noteLength);
}

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
    scheduleNote(index++, nextNoteTime);
    nextNote();
  }
}

export function play(o = {}) {
  if (o.tempo) {
    tempo = o.tempo;
  }
  if (o.frequencies) {
    frequencies = o.frequencies;
  }

  if (!unlocked) {
    var buffer = audioContext.createBuffer(1, 1, 22050);
    var node = audioContext.createBufferSource();
    node.buffer = buffer;
    node.start(0);
    unlocked = true;
  }

  isPlaying = !isPlaying;
  // console.log(`metronome -> ${isPlaying}`);

  if (isPlaying) {
    nextNoteTime = audioContext.currentTime;
    timerWorker.postMessage('start');
    return 'stop';
  } else {
    timerWorker.postMessage('stop');
    return 'play';
  }
}

export function getTempo() {
  return tempo;
}

export function setTempo(tempo_) {
  tempo = tempo_;
  nextNoteTime = 0;
  nextNote();
}

export function isRunning() {
  return isPlaying;
}

function init() {
  audioContext = new AudioContext();
  timerWorker = new Worker('worker.mjs');
  timerWorker.onmessage = function (e) {
    if (e.data == 'tick') {
      scheduler();
    } else console.log('message: ' + e.data);
  };
  timerWorker.postMessage({ interval: lookahead });
}

init();
