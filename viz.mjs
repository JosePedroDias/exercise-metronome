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
  let isPaused = true;

  const ctx = el.getContext('2d');

  (parent || document.body).appendChild(el);

  const lineWidth = side * 0.02;
  const cx = side / 2;
  const cy = side / 2;
  const r = side * 0.4;

  const INITIAL_ANGLE = -90;

  const FONT_FAMILY = 'sans-serif';
  const FONT_SIZE_LABEL = side * 0.04;
  const FONT_SIZE_STEP = side * 0.075;
  const FONT_SIZE_SESSION = side * 0.08;

  const bgColor = '#333';
  const cursorColor = '#ddd';
  const stepColor = '#aaa';
  const sessionColor = '#ddd';

  const colors = {
    R: '#73b1c0',
    L: '#dd4',
    M: '#d74',
    H: '#d44',
  };

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  function getAlpha() {
    return isPaused ? 0.66 : 1;
  }

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

    ctx.globalAlpha = getAlpha();

    ctx.fillStyle = stepColor;
    ctx.font = `${FONT_SIZE_STEP}px ${FONT_FAMILY}`;
    {
      const { step, stepTime } = getCurrentStepInfo();
      const t = stepTime.toFixed(0);
      const d = step.seconds;
      drawText(cx, cy - side * 0.04, `${toMinsSecs(t)} / ${toMinsSecs(d - t)}`);
    }

    ctx.fillStyle = sessionColor;
    ctx.font = `${FONT_SIZE_SESSION}px ${FONT_FAMILY}`;
    {
      const t = sessionCurrentTime.toFixed(0);
      const d = sessionDuration;
      drawText(cx, cy + side * 0.05, `${toMinsSecs(t)} / ${toMinsSecs(d - t)}`);
    }

    ctx.font = `${FONT_SIZE_LABEL}px ${FONT_FAMILY}`;

    let angle = INITIAL_ANGLE;
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
      ctx.strokeStyle = bgColor;
      ctx.globalAlpha = 0.85 * getAlpha();
      drawArc(cx, cy, r, INITIAL_ANGLE, angle);
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = getAlpha();
    }

    angle += INITIAL_ANGLE;

    ctx.strokeStyle = cursorColor;
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

  function setPaused(isPaused_) {
    isPaused = isPaused_;
    draw();
  }

  setSteps(steps);
  draw();

  return {
    el,
    setSteps,
    setPaused,
    setSessionCurrentTime,
    getCurrentStepInfo,
    getCurrentRpm,
  };
}
