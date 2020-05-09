const raf = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

let t = 0;
const schedules = [];

let pauseTime;

// { name, duration, repeat, callback }
export function addToScheduler(schedule) {
  if (!schedule.name) {
    throw new Error('name is required!');
  }
  if (!isFinite(schedule.duration)) {
    throw new Error('duration is a required number!');
  }
  if (typeof schedule.callback !== 'function') {
    throw new Error('callback is a required function!');
  }
  schedule.times = 0;
  schedule.startedAt = t;
  schedule.firesAt = t + schedule.duration;
  // console.log(schedule);
  schedules.push(schedule);
}

export function isInScheduler(scheduleName) {
  return schedules.findIndex((sch) => sch.name === scheduleName) !== -1;
}

export function removeFromScheduler(scheduleName) {
  const i = schedules.findIndex((sch) => sch.name === scheduleName);
  if (i !== -1) {
    schedules.splice(i, 1);
  }
}

export function pauseScheduling() {
  pauseTime = t;
}

export function resumeScheduling() {
  const dt = t - pauseTime;
  for (let i = 0; i < schedules.length; ++i) {
    const sch = schedules[i];
    sch.firesAt += dt;
    sch.startedAt += dt;
  }
  pauseTime = undefined;
}

function step(t_) {
  raf(step);

  t = t_;

  if (pauseTime) {
    return;
  }

  for (let i = 0; i < schedules.length; ++i) {
    const sch = schedules[i];
    if (t >= sch.firesAt) {
      ++sch.times;
      sch.callback(sch, t);
      if (sch.repeat) {
        sch.firesAt = t + sch.duration;
      } else {
        schedules.splice(i, 1);
      }
    }
  }
}

step(0);
