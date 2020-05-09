import { speak } from './tts.mjs';
import { describeStep } from './describe.mjs';
import { plan } from './plan.mjs';
import { KEY_ENTER, KEY_SPACE } from './keys.mjs';
import { processPlan } from './process-plan.mjs';
import {
  setSteps,
  setSessionCurrentTime,
  getCurrentStep,
  getCurrentStepTimeLeft,
  getCurrentRpm,
} from './session-manager.mjs';
import { play, isRunning, setTempo, getTempo } from './metronome.mjs';
import {
  addToScheduler,
  isInScheduler,
  pauseScheduling,
  resumeScheduling,
} from './scheduler.mjs';
import { storageFactory } from './storage.mjs';
import { roundToPair } from './utils.mjs';
import { requestLock, cancelLock } from './wake-lock.mjs';

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
let wakeLockReq;

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

function setupStep() {
  speakCurrentStep();

  if (isInScheduler('viz-update')) {
    resumeScheduling();
  } else {
    addToScheduler({
      name: 'viz-update',
      duration: 1000 / 10,
      repeat: true,
      callback: ({ startedAt }, t) => {
        sessionTime = (t - startedAt) / 1000;
        console.log(`sessionTime: ${sessionTime.toFixed(1)}`);
        try {
          setSessionCurrentTime(sessionTime);
          vizComp.update();
        } catch (_) {
          pause();
          speak('you have completed your session!');
          return;
        }

        const rpm = getCurrentRpm();
        const tempo = getTempo();
        if (rpm !== tempo / 2) {
          console.log('setting rpm to', rpm);
          setTempo(rpm * 2);
          speakCurrentStep();
        }
      },
    });
  }
}

function pause() {
  play();
  pauseScheduling();

  cancelLock(wakeLockReq);
}

function unpause() {
  const rpm = getCurrentRpm();
  play({ tempo: rpm * 2 });
  setupStep();

  requestLock().then((wakeLockReq_) => {
    wakeLockReq = wakeLockReq_;
  });
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
