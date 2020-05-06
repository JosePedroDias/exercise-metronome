export function button({ label, parent, onClick }) {
  const buttonEl = document.createElement('button');
  buttonEl.appendChild(document.createTextNode(label));

  buttonEl.addEventListener('click', (ev) => {
    return onClick?.(ev.target.value);
  });

  (parent || document.body).appendChild(buttonEl);

  return buttonEl;
}
