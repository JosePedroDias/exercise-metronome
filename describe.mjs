import { toMinsSecsInternal } from './utils.mjs';
import { i18n } from './constants/i18n.mjs';
import { getLang } from './get-lang.mjs';

const lang = getLang();
const words = i18n[lang].words;
const intervalNames = i18n[lang].intervalNames;

function pluralize(word, n) {
  return n === 1 ? word : word + 's';
}

export function describeTime(seconds) {
  const [mins, secs] = toMinsSecsInternal(seconds);
  const parts = [];
  if (mins) {
    parts.push(`${mins} ${pluralize(words.minute, mins)}`);
  }
  if (secs) {
    parts.push(`${secs} ${pluralize(words.second, mins)}`);
  }
  return parts.join(` ${words.and} `);
}

export function describeIntensity(int) {
  return intervalNames[int];
}

export function describeStep({ seconds, intensity }) {
  return `${describeTime(seconds)} ${words.of} ${describeIntensity(intensity)}`;
}
