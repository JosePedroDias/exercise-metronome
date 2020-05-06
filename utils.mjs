const DEG2RAD = Math.PI / 180;

export function zeroPad(n) {
  return n < 10 ? '0' + n : n;
}

export function sumProp(arr, propName) {
  return arr.reduce((prev, curr) => prev + curr[propName], 0);
}

export function toMinsSecs(t) {
  const mins = Math.floor(t / 60);
  const secs = t - mins * 60;
  if (!mins) {
    return secs;
  }
  return `${mins}:${zeroPad(secs)}`;
}

export function toPolar(x, y, r, angle) {
  return [r * Math.cos(angle * DEG2RAD) + x, r * Math.sin(angle * DEG2RAD) + x];
}
