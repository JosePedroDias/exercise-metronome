// https://simon.html5.org/dump/html5-canvas-cheat-sheet.html

import { sumProp } from './utils.mjs';
import { rpms } from './rpms.mjs';

let steps;
let sessionCurrentTime = 0;
let sessionDuration;
let sessionPercentage;

export function setSteps(steps_) {
  sessionCurrentTime = 0;
  sessionDuration = sumProp(steps_, 'seconds');
  sessionPercentage = 0;
  steps = steps_;
}

function _getCurrentStep() {
  let s = 0;
  for (let step of steps) {
    if (sessionCurrentTime >= s && sessionCurrentTime <= s + step.seconds) {
      return { step, stepTime: sessionCurrentTime - s };
    }
    s += step.seconds;
  }
  return {};
}

export function getCurrentStep() {
  return _getCurrentStep().step;
}

export function getSessionCurrentTime() {
  return sessionCurrentTime;
}

export function getCurrentStepCurrentTime() {
  return _getCurrentStep().stepTime || 0;
}

export function getCurrentStepTimeLeft() {
  return getCurrentStepDuration() - getCurrentStepCurrentTime();
}

export function setSessionCurrentTime(ct) {
  sessionCurrentTime = ct;
  sessionPercentage = Math.min(
    sessionDuration,
    Math.max(0, ct / sessionDuration)
  );
}

export function getCurrentStepIntensity() {
  const step = getCurrentStep();
  if (!step) {
    return;
  }
  return step.intensity;
}

export function getCurrentStepDuration() {
  const step = getCurrentStep();
  if (!step) {
    return;
  }
  return step.seconds;
}

export function getCurrentRpm() {
  return rpms[getCurrentStepIntensity()] || 0;
}

export function getSessionPercentage() {
  return sessionPercentage;
}

export function getSessionDuration() {
  return sessionDuration;
}
