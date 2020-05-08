import { speak } from './tts.mjs';
import { describeStep } from './describe.mjs';
import { plan } from './plan.mjs';
import { processPlan } from './process-plan.mjs';
import { play, isRunning, setTempo, getTempo } from './metronome.mjs';
import {
  addToScheduler,
  isInScheduler,
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

function onProgramChange(program_) {
  program = program_;
  storage.setItem('initiallySelected', program);

  steps = processPlan(plan[program]);

  if (!vizComp) {
    const { width, height } = mainCtnEl.getBoundingClientRect();
    const side = roundToPair(Math.min(width, height));
    vizComp = viz({ parent: mainCtnEl, side, steps });
  } else {
    vizComp.setSteps(steps);
  }

  sessionTime = 0;
  vizComp.setSessionCurrentTime(sessionTime);
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
  const { step } = vizComp.getCurrentStepInfo();
  speak(describeStep(step));
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

        try {
          vizComp.setSessionCurrentTime(sessionTime);
        } catch (_) {
          pause();
          speak('you have completed your session!');
          return;
        }

        const rpm = vizComp.getCurrentRpm();
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
}

function togglePause() {
  const rpm = vizComp.getCurrentRpm();

  const running = !isRunning();
  vizComp.setPaused(!running);

  if (running) {
    play({ tempo: rpm * 2 });
    setupStep();
  } else {
    pause();
  }
}

document.body.addEventListener('click', togglePause);

onProgramChange(initiallySelected);
