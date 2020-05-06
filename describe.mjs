import { toMinsSecsInternal } from './utils.mjs';

function pluralize(word, n) {
  return n === 1 ? word : word + 's';
}

export function describeTime(seconds) {
  const [mins, secs] = toMinsSecsInternal(seconds);
  const parts = [];
  if (mins) {
    parts.push(`${mins} ${pluralize('minute', mins)}`);
  }
  if (secs) {
    parts.push(`${secs} ${pluralize('seconds', mins)}`);
  }
  return parts.join(' and ');
}

const ints = {
  R: 'rest',
  L: 'low intensity rowing',
  M: 'medium intensity rowing',
  H: 'high intensity rowing',
};

export function describeIntensity(int) {
  return ints[int];
}

export function describeStep({ seconds, intensity }) {
  return `${describeTime(seconds)} of ${describeIntensity(intensity)}`;
}
