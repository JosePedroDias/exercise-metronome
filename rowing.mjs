import { NoSleep } from './no-sleep.mjs';
import { speak } from './tts.mjs';
import { describeStep } from './describe.mjs';
import { plan } from './rowing-plan.mjs';
import { KEY_ENTER, KEY_SPACE } from './keys.mjs';
import { processPlan } from './process-plan.mjs';
import {
  setSteps,
  setSessionCurrentTime,
  getSessionDuration,
  getCurrentStep,
  getCurrentStepTimeLeft,
  getCurrentRpm,
} from './session-manager.mjs';
import { play, isRunning, setTempo, getTempo } from './metronome.mjs';
import {
  addToScheduler,
  isInScheduler,
  removeFromScheduler,
  pauseScheduling,
  resumeScheduling,
} from './scheduler.mjs';
import { storageFactory } from './storage.mjs';
import { roundToPair } from './utils.mjs';

import { select } from './select.mjs';
import { viz } from './viz.mjs';

const topCtnEl = document.querySelector('.top');
const mainCtnEl = document.querySelector('.main');

const storage = storageFactory('rowMet');

const programs = Object.keys(plan);
let steps;
let sessionTime = 0;
let vizComp;
let program;

const noSleep = new NoSleep();

function setNoSleepOn() {
  // must be called on UI event handler
  document.addEventListener(
    'click',
    function enableNoSleep() {
      document.removeEventListener('click', enableNoSleep, false);
      noSleep.enable();
    },
    false
  );
}

function setNoSleepOff() {
  noSleep.disable();
}

function onProgramChange(program_) {
  program = program_;
  storage.setItem('initiallySelected', program);

  sessionTime = 0;
  steps = processPlan(plan[program]);

  setSteps(steps);
  setSessionCurrentTime(sessionTime);

  if (!vizComp) {
    const { width, height } = mainCtnEl.getBoundingClientRect();
    const side = roundToPair(Math.min(width, height));
    vizComp = viz({ parent: mainCtnEl, side, steps });
  } else {
    vizComp.setSteps(steps);
  }
}

const initiallySelected = storage.getItem('initiallySelected') || programs[0];

select({
  parent: topCtnEl,
  options: programs,
  initiallySelected,
  onSelected: (selection) => {
    onProgramChange(selection);
  },
});

function speakCurrentStep() {
  const step = getCurrentStep();
  const step2 = {
    ...step,
    seconds: Math.floor(getCurrentStepTimeLeft()),
  };
  speak(describeStep(step2));
}

function onTick(sessionTime_) {
  sessionTime = sessionTime_;
  // console.log(`sessionTime: ${sessionTime.toFixed(1)}`);

  if (sessionTime > getSessionDuration()) {
    pause();
    speak('you have completed your session!');

    sessionTime = 0;
    setSessionCurrentTime(sessionTime);
    vizComp.update();

    removeFromScheduler('tick');
    return;
  }

  setSessionCurrentTime(sessionTime);
  vizComp.update();

  const rpm = getCurrentRpm();
  const tempo = getTempo();
  if (rpm !== tempo / 2) {
    setTempo(rpm * 2);
    speakCurrentStep();
  }
}

function setupStep() {
  speakCurrentStep();

  if (isInScheduler('tick')) {
    resumeScheduling();
  } else {
    addToScheduler({
      name: 'tick',
      duration: 1000 / 10,
      repeat: true,
      callback: ({ startedAt }, t) => {
        return onTick((t - startedAt) / 1000);
      },
    });
  }
}

function pause() {
  setNoSleepOff();
  play();
  pauseScheduling();
}

function unpause() {
  setNoSleepOn();
  const rpm = getCurrentRpm();
  play({ tempo: rpm * 2 });
  setupStep();
}

function togglePause() {
  const running = !isRunning();
  vizComp.setPaused(!running);

  if (running) {
    unpause();
  } else {
    pause();
  }
}

document.body.addEventListener('click', togglePause);

document.body.addEventListener('keydown', (ev) => {
  const kc = ev.keyCode;
  const hasModifiers = Boolean(
    ev.shiftKey || ev.altKey || ev.ctrlKey || ev.metaKey
  );
  if (!hasModifiers) {
    if (kc === KEY_SPACE || KEY_ENTER) {
      togglePause();
    }
  }
});

onProgramChange(initiallySelected);
