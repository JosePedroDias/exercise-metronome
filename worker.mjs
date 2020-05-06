let timer;
let interval = 100;

self.onmessage = (ev) => {
  if (ev.data == 'start') {
    timer = setInterval(() => {
      postMessage('tick');
    }, interval);
  } else if (ev.data.interval) {
    interval = ev.data.interval;
    if (timer) {
      clearInterval(timer);
      timer = setInterval(() => {
        postMessage('tick');
      }, interval);
    }
  } else if (ev.data == 'stop') {
    clearInterval(timer);
    timer = undefined;
  }
};
