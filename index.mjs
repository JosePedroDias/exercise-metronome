import { speak } from './tts.mjs';
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

import { select } from './select.mjs';
import { button } from './button.mjs';
import { viz } from './viz.mjs';

const storage = storageFactory('rowMet');

const programs = Object.keys(plan);
let steps;
let sessionTime = 0;

let textComp, vizComp, program;

function onProgramChange(program_) {
  program = program_;
  storage.setItem('initiallySelected', program);

  steps = processPlan(plan[program]);

  if (!vizComp) {
    vizComp = viz({ side: 600, steps });
  } else {
    vizComp.setSteps(steps);
  }

  sessionTime = 0;
  vizComp.setSessionCurrentTime(sessionTime);
}

const initiallySelected = storage.getItem('initiallySelected') || programs[0];

select({
  options: programs,
  initiallySelected,
  onSelected: (selection) => {
    onProgramChange(selection);
  },
});

function setupStep() {
  if (isInScheduler('viz-update')) {
    resumeScheduling();
  } else {
    addToScheduler({
      name: 'viz-update',
      duration: 1000 / 10,
      repeat: true,
      callback: ({ times, startedAt }, t) => {
        sessionTime = (t - startedAt) / 1000;

        const rpm = vizComp.getCurrentRpm();

        // console.log(`TICK ${times} ${sessionTime.toFixed(1)} ${rpm}`);
        vizComp.setSessionCurrentTime(sessionTime);

        const tempo = getTempo();
        if (rpm !== tempo / 2) {
          console.log('setting rpm to', rpm);
          setTempo(rpm * 2);
        }
      },
    });
  }
}

function pause() {
  play();
  pauseScheduling();
}

button({
  label: 'go',
  onClick: () => {
    // speak('hello world');

    const rpm = vizComp.getCurrentRpm();

    const running = !isRunning();

    console.log('clicked', rpm, running);

    if (running) {
      play({ tempo: rpm * 2 });
      setupStep();
    } else {
      pause();
    }
  },
});

onProgramChange(initiallySelected);
