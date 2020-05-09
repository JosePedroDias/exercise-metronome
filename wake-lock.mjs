// https://w3c.github.io/screen-wake-lock/
// https://medium.com/dev-channel/experimenting-with-the-wake-lock-api-b6f42e0a089f

export function isWakeLockSupported() {
  return Boolean('getWakeLock' in navigator);
}

export async function requestLock() {
  if (!isWakeLockSupported()) {
    return false;
  }

  try {
    const wakeLock = await navigator.getWakeLock('screen');
    return wakeLock.createRequest();
  } catch (ex) {
    // console.warn(ex);
    return false;
  }
}

export function cancelLock(wakeLock) {
  wakeLock && wakeLock.cancel();
}
