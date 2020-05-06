import { tokenize, parse, processPlan } from './process-plan.mjs';

describe('tokenize', () => {
  it('tokenize basics', () => {
    expect(tokenize('8M')).toEqual([
      {
        kind: 'number',
        value: 8,
      },
      {
        kind: 'intensity',
        value: 'M',
      },
    ]);
  });

  expect(tokenize('30R')).toEqual([
    {
      kind: 'number',
      value: 30,
    },
    {
      kind: 'intensity',
      value: 'R',
    },
  ]);
  expect(tokenize("15'L 2*(3R 4M)")).toEqual([
    { value: 15, kind: 'number' },
    { value: "'", kind: 'op' },
    { value: 'L', kind: 'intensity' },
    { value: 2, kind: 'number' },
    { value: '*', kind: 'op' },
    { value: '(', kind: 'parens' },
    { value: 3, kind: 'number' },
    { value: 'R', kind: 'intensity' },
    { value: 4, kind: 'number' },
    { value: 'M', kind: 'intensity' },
    { value: ')', kind: 'parens' },
  ]);
});

describe('parse', () => {
  it('parse basics', () => {
    expect(parse(tokenize('8M'))).toEqual([
      {
        seconds: 480,
        intensity: 'M',
      },
    ]);
    expect(parse(tokenize("8'M"))).toEqual([
      {
        seconds: 8,
        intensity: 'M',
      },
    ]);
    expect(parse(tokenize("15'L 2*(3R 4M)"))).toEqual([
      { seconds: 15, intensity: 'L' },
      { seconds: 180, intensity: 'R' },
      { seconds: 240, intensity: 'M' },
      { seconds: 180, intensity: 'R' },
      { seconds: 240, intensity: 'M' },
    ]);
    expect(parse(tokenize("1'R 2'L 3'R 4'M 5'R"))).toEqual([
      { seconds: 2, intensity: 'L' },
      { seconds: 3, intensity: 'R' },
      { seconds: 4, intensity: 'M' },
    ]);
  });
});
