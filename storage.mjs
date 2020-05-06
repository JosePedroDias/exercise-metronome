export function storageFactory(prefix) {
  function getItem(key) {
    const raw = localStorage.getItem(`${prefix}_${key}`);
    if (raw !== undefined) {
      return JSON.parse(raw);
    }
  }

  function setItem(key, value) {
    const raw = JSON.stringify(value);
    localStorage.setItem(`${prefix}_${key}`, raw);
  }

  return { getItem, setItem };
}
