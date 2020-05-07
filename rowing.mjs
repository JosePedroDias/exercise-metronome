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

import { select } from './select.mjs';
import { button } from './button.mjs';
import { viz } from './viz.mjs';

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
        sessionTime = (t - startedAt) / 100;

        try {
          vizComp.setSessionCurrentTime(sessionTime);
        } catch (_) {
          pause();
          speak('you have completed your session. congratulations!');
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

button({
  label: 'go',
  onClick: () => {
    const rpm = vizComp.getCurrentRpm();

    const running = !isRunning();

    if (running) {
      play({ tempo: rpm * 2 });
      setupStep();
    } else {
      pause();
    }
  },
});

onProgramChange(initiallySelected);
