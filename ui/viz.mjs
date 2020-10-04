// https://simon.html5.org/dump/html5-canvas-cheat-sheet.html

const DEG2RAD = Math.PI / 180;

import { toPolar, toMinsSecs } from '../utils.mjs';
import {
  getCurrentStepDuration,
  getCurrentStepCurrentTime,
  getSessionCurrentTime,
  getSessionDuration,
  getSessionPercentage,
} from '../session-manager.mjs';
import { i18n } from '../constants/i18n.mjs';
import { getLang } from '../get-lang.mjs';

const intervalLabels = i18n[getLang()].intervalLabels;

export function viz({ steps, side, parent }) {
  const el = document.createElement('canvas');
  el.setAttribute('width', side);
  el.setAttribute('height', side);

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
    const sessionDuration = getSessionDuration();

    ctx.clearRect(0, 0, side, side);

    ctx.globalAlpha = getAlpha();

    if (sessionDuration) {
      ctx.fillStyle = stepColor;
      ctx.font = `${FONT_SIZE_STEP}px ${FONT_FAMILY}`;
      {
        const t = getCurrentStepCurrentTime();
        const d = getCurrentStepDuration();
        drawText(
          cx,
          cy - side * 0.04,
          `${toMinsSecs(t, 1)} / ${toMinsSecs(d - t, 1)}`
        );
      }

      ctx.fillStyle = sessionColor;
      ctx.font = `${FONT_SIZE_SESSION}px ${FONT_FAMILY}`;
      {
        const t = getSessionCurrentTime();
        const d = sessionDuration;
        drawText(
          cx,
          cy + side * 0.05,
          `${toMinsSecs(t, 1)} / ${toMinsSecs(d - t, 1)}`
        );
      }
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
      ctx.fillStyle = color;
      drawText(tx, ty, intervalLabels[intensity]);

      angle += dAngle;
    }

    const sessionPercentage = getSessionPercentage();
    angle = sessionPercentage * 360;

    if (sessionPercentage) {
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

  function setPaused(isPaused_) {
    isPaused = isPaused_;
    draw();
  }

  function setSteps(steps_) {
    steps = steps_;
    draw();
  }

  function update() {
    draw();
  }

  draw();

  return {
    el,
    setSteps,
    setPaused,
    update,
  };
}
