import { rpms } from './rpms.mjs';
import { plan } from './plan.mjs';
import { processPlan } from './process-plan.mjs';
import { play } from './metronome.mjs';
import { add } from './scheduler.mjs';
import { select } from './select.mjs';
import { button } from './button.mjs';

const programs = Object.keys(plan);

select({
  options: programs,
  initiallySelected: 'w3 d1',
  onSelected: (selection) => {
    console.log(selection);
  },
});

button({
  label: 'play',
  onClick: () => {
    console.log('asd');
  },
});

const program = 'w3 d1';
const steps = processPlan(plan[program]);
console.log(steps);

// play({ tempo: 23 * 2 });

add({
  name: '2sec tick',
  duration: 2000,
  repeat: true,
  callback: ({ times }) => {
    console.log(`TICK ${times}`);
  },
});
