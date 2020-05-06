import { rpms } from './rpms.mjs';
import { plan } from './plan.mjs';
import { processPlan } from './process-plan.mjs';
import { play } from './metronome.mjs';
import { add } from './scheduler.mjs';
import { storageFactory } from './storage.mjs';

import { select } from './select.mjs';
import { button } from './button.mjs';
import { text } from './text.mjs';
import { viz } from './viz.mjs';

import { toMinsSecs, sumProp } from './utils.mjs';

const storage = storageFactory('rowMet');

const programs = Object.keys(plan);

let textComp, vizComp, program;

function onProgramChange(program_) {
  program = program_;
  storage.setItem('initiallySelected', program);

  const steps = processPlan(plan[program]);
  console.log(steps);

  const sessionDuration = sumProp(steps, 'seconds');

  textComp.setLabel(toMinsSecs(sessionDuration));

  if (!vizComp) {
    vizComp = viz({ side: 600, steps });
  } else {
    vizComp.setSteps(steps);
  }
}

const initiallySelected = storage.getItem('initiallySelected') || programs[0];

select({
  options: programs,
  initiallySelected,
  onSelected: (selection) => {
    onProgramChange(selection);
  },
});

button({
  label: 'go',
  onClick: () => {
    console.log('clicked play');
    play({ tempo: 23 * 2 });
  },
});

textComp = text({ label: 'session duration' });

onProgramChange(initiallySelected);

/* add({
  name: '2sec tick',
  duration: 2000,
  repeat: true,
  callback: ({ times }) => {
    console.log(`TICK ${times}`);
  },
});*/
