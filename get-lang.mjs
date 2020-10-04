import { storageFactory } from './storage.mjs';

const storage = storageFactory('rowMet');

export function getLang() {
  return storage.getItem('lang') || 'en';
}
