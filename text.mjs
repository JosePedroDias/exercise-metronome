export function text({ label, parent }) {
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(label));

  function setLabel(lbl) {
    const textNode = el.childNodes[0];
    textNode.nodeValue = lbl;
  }

  (parent || document.body).appendChild(el);

  return { setLabel, el };
}
