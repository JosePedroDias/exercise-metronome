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

  const FONT_FAMILY = 'sans-serif';
  const FONT_SIZE_LABEL = 24;
  const FONT_SIZE_STEP = 40;
  const FONT_SIZE_SESSION = 44;

  const colors = {
    R: 'green',
    L: 'yellow',
    M: 'orange',
    H: 'red',
  };

  //ctx.lineCap = 'round';
  //ctx.lineJoin = 'round';

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
    ctx.fillStyle = 'black';

    ctx.clearRect(0, 0, side, side);

    ctx.font = `${FONT_SIZE_STEP}px ${FONT_FAMILY}`;
    {
      const { step, stepTime } = getCurrentStepInfo();
      const t = stepTime.toFixed(0);
      const d = step.seconds;
      drawText(cx, cy - 28, `${toMinsSecs(t)} / ${toMinsSecs(d - t)}`);
    }

    ctx.font = `${FONT_SIZE_SESSION}px ${FONT_FAMILY}`;
    {
      const t = sessionCurrentTime.toFixed(0);
      const d = sessionDuration;
      drawText(cx, cy + 40, `${toMinsSecs(t)} / ${toMinsSecs(d - t)}`);
    }

    ctx.font = `${FONT_SIZE_LABEL}px ${FONT_FAMILY}`;

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
      // drawText(tx, ty, `${intensity} ${toMinsSecs(dur)}`);
      ctx.fillStyle = color;
      drawText(tx, ty, `${intensity}`);

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

  function getCurrentStepInfo() {
    let s = 0;
    for (let step of steps) {
      if (sessionCurrentTime >= s && sessionCurrentTime <= s + step.seconds) {
        return { step, stepTime: sessionCurrentTime - s };
      }
      s += step.seconds;
    }
  }

  function getCurrentRpm() {
    const { step } = getCurrentStepInfo();
    return rpms[step.intensity];
  }

  setSteps(steps);
  draw();

  return {
    el,
    setSteps,
    setSessionCurrentTime,
    getCurrentStepInfo,
    getCurrentRpm,
  };
}
