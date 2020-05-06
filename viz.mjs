// https://simon.html5.org/dump/html5-canvas-cheat-sheet.html

const DEG2RAD = Math.PI / 180;

import { sumProp, toPolar, toMinsSecs } from './utils.mjs';
import { rpms } from './rpms.mjs';

export function viz({ steps, side, parent }) {
  const el = document.createElement('canvas');
  el.setAttribute('width', side);
  el.setAttribute('height', side);

  let percentage = 0;
  let sessionCurrentTime = 0;
  let sessionDuration;

  const ctx = el.getContext('2d');

  (parent || document.body).appendChild(el);

  const lineWidth = 12;
  const cx = side / 2;
  const cy = side / 2;
  const r = side * 0.4;

  const colors = {
    R: 'green',
    L: 'yellow',
    M: 'orange',
    H: 'red',
  };

  //ctx.lineCap = 'round';
  //ctx.lineJoin = 'round';

  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'black';

  function drawArc(cx, cy, r, angleI, dAngle) {
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      r - lineWidth / 2,
      angleI * DEG2RAD,
      (angleI + dAngle) * DEG2RAD
    );
    ctx.stroke();
  }

  function drawLine(ax, ay, bx, by) {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  function drawText(x, y, txt) {
    ctx.fillText(txt, x, y);
  }

  function draw() {
    ctx.clearRect(0, 0, side, side);

    let angle = 0;
    ctx.lineWidth = lineWidth;
    for (let s of steps) {
      const intensity = s.intensity;
      const dur = s.seconds;
      const percentage = dur / sessionDuration;
      const dAngle = percentage * 360;
      const color = colors[intensity];
      ctx.strokeStyle = color;

      drawArc(cx, cy, r, angle, dAngle);

      const [tx, ty] = toPolar(cx, cy, r - 60, angle + dAngle / 2);
      drawText(tx, ty, `${intensity} ${toMinsSecs(dur)}`);

      angle += dAngle;
    }

    angle = percentage * 360;

    if (percentage) {
      ctx.lineWidth = lineWidth * 1.3;
      ctx.strokeStyle = 'white';
      ctx.globalAlpha = 0.9;
      drawArc(cx, cy, r, 0, angle);
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = 'black';
    const [ax, ay] = toPolar(cx, cy, r - lineWidth * 2, angle, angle);
    const [bx, by] = toPolar(cx, cy, r + lineWidth * 1, angle, angle);
    drawLine(ax, ay, bx, by);
  }

  function setSteps(steps_) {
    sessionDuration = sumProp(steps, 'seconds');
    percentage = 0;
    steps = steps_;
    draw();
  }

  function setSessionCurrentTime(ct) {
    sessionCurrentTime = ct;
    percentage = Math.min(sessionDuration, Math.max(0, ct / sessionDuration));
    draw();
  }

  function getCurrentStep() {
    let s = 0;
    for (let step of steps) {
      // TODO TEST
      if (s >= sessionCurrentTime && s + step.seconds <= sessionCurrentTime) {
        return step;
      }
    }
  }

  function getCurrentRpm() {
    const step = getCurrentStep();
    return rpms[step.intensity];
  }

  setSteps(steps);
  draw();

  //setSessionCurrentTime(300);

  console.log('getCurrentStep', getCurrentStep());
  console.log('getCurrentRpm', getCurrentRpm());

  /* {
    let t = 0;
    setInterval(() => setSessionTime((t += 10)), 1000);
  } */

  return { el, setSteps, setSessionCurrentTime, getCurrentStep, getCurrentRpm };
}
