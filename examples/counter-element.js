class Counter extends HTMLElement {
  let x;

  let clicked = () => {
    x++;
    window.requestAnimationFrame(() => render());
  }

  let render = () => {
    this.textContent = x.toString();
  }

  constructor() {
    super();
    x = 0;
    this.onclick = () => clicked();
  }

  connectedCallback() {
    render();
  }
}

window.customElements.define('num-counter', Counter);
