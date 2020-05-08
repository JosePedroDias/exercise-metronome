export function select({ options, initiallySelected, parent, onSelected }) {
  const selectEl = document.createElement('select');
  for (let opt of options) {
    const optionEl = document.createElement('option');
    optionEl.appendChild(document.createTextNode(opt));
    optionEl.value - opt;
    if (initiallySelected === opt) {
      optionEl.selected = 'selected';
    }
    selectEl.appendChild(optionEl);
  }

  selectEl.addEventListener('click', (ev) => {
    ev.stopPropagation();
  });

  selectEl.addEventListener('change', (ev) => {
    return onSelected?.(ev.target.value);
  });

  (parent || document.body).appendChild(selectEl);

  return selectEl;
}
