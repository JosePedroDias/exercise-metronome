const LPAR = '(';
const RPAR = ')';
const PARENS = [LPAR, RPAR];
const MULT = '*';
const SPC = ' ';
const SEC_TICK = "'";
const NUMBERS = '0123456789'.split('');
const INTENSITIES = 'RLMH'.split('');

const KIND_NUMBER = 'number';
const KIND_INTENSITY = 'intensity';
const KIND_OP = 'op';
const KIND_PARENS = 'parens';

/*
EVERYTHING = NUMS+ MULT ITEMS... or ITEMS...
*/

function findLastIndex(array, predicate) {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) {
      return l;
    }
  }
  return -1;
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function repeat(times, arr) {
  let res = [];
  for (let i = 0; i < times; ++i) {
    res = res.concat(clone(arr));
  }
  return res;
}

export function tokenize(s) {
  return s
    .split('')
    .map((c) => {
      if (NUMBERS.indexOf(c) !== -1) {
        return { value: parseInt(c, 10), kind: KIND_NUMBER };
      }
      if (INTENSITIES.indexOf(c) !== -1) {
        return { value: c, kind: KIND_INTENSITY };
      }
      if (PARENS.indexOf(c) !== -1) {
        return { value: c, kind: KIND_PARENS };
      }
      if (c === MULT) {
        return { value: c, kind: KIND_OP };
      }
      if (c === SEC_TICK) {
        return { value: c, kind: KIND_OP };
      }
      if (c === SPC) {
        return undefined;
      }
      throw new Error(`Unsupported char "${c}"`);
    })
    .filter((n) => Boolean(n))
    .reduce((prev, curr) => {
      const last = prev[prev.length - 1];
      if (last && last.kind === KIND_NUMBER && curr.kind === KIND_NUMBER) {
        last.value = last.value * 10 + curr.value;
        return prev;
      }
      return [...prev, curr];
    }, []);
}

export function parse(tokens) {
  // num '?
  for (let i = 0; i < tokens.length; ++i) {
    const tThis = tokens[i];
    const tNext = tokens[i + 1];
    if (tThis.kind === KIND_NUMBER) {
      if (!tNext || (tNext.value !== SEC_TICK && tNext.value !== MULT)) {
        tThis.value *= 60;
      } else if (tNext.value === MULT) {
      } else {
        tokens.splice(i + 1, 1);
      }
    }
  }

  // num * ( .... )
  while (true) {
    const i = tokens.findIndex((t) => t.value === MULT);
    if (i === -1) {
      break;
    }
    const prev = tokens[i - 1];
    if (prev.kind !== KIND_NUMBER) {
      throw new Error('Expect number before * op!');
    }
    const next = tokens[i + 1];
    if (next.value !== LPAR) {
      throw new Error('Expect parens after ( * op!');
    }
    const f = findLastIndex(tokens, (t) => t.value === RPAR);
    if (f === -1) {
      throw new Error('Expect closing parens!');
    }

    const before = tokens.slice(0, i - 1);
    const after = tokens.slice(f + 1);
    const times = prev.value;
    const expr = tokens.slice(i + 2, f);

    tokens = [...before, ...repeat(times, expr), ...after];
  }

  // group numbers with intensities
  const parts = [];
  for (let i = 0; i < tokens.length; i += 2) {
    parts.push({
      seconds: tokens[i].value,
      intensity: tokens[i + 1].value,
    });
  }

  // drop starting or ending rests
  for (let i = 0; i < parts.length; ++i) {
    if (parts[i].intensity === 'R') {
      parts.shift();
      --i;
    } else {
      break;
    }
  }
  for (let i = parts.length - 1; i >= 0; --i) {
    if (parts[i].intensity === 'R') {
      parts.pop();
    } else {
      break;
    }
  }

  return parts;
}

export function processPlan(planStr) {
  return parse(tokenize(planStr));
}
