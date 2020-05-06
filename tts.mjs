export function speak(text) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.5;
  window.speechSynthesis.speak(utter);
}
