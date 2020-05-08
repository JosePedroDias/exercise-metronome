const DEG2RAD = Math.PI / 180;

export function zeroPad(n) {
  return n < 10 ? '0' + n : n;
}

export function sumProp(arr, propName) {
  return arr.reduce((prev, curr) => prev + curr[propName], 0);
}

export function toMinsSecsInternal(t) {
  const mins = Math.floor(t / 60);
  const secs = t - mins * 60;
  return [mins, secs];
}

export function toMinsSecs(t) {
  const [mins, secs] = toMinsSecsInternal(t);
  return `${mins}:${zeroPad(secs)}`;
}

export function toPolar(x, y, r, angle) {
  return [r * Math.cos(angle * DEG2RAD) + x, r * Math.sin(angle * DEG2RAD) + x];
}

export function roundToPair(n) {
  const rest = n % 2;
  return n - rest;
}
