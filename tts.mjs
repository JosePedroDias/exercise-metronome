import { getLang } from './get-lang.mjs';

export function speak(text) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    //return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  console.log(text);
  utter.lang = getLang();
  // utter.lang = 'en-US';
  // utter.lang = 'pt-PT';
  // utter.rate = 1.5;
  window.speechSynthesis.speak(utter);
}
