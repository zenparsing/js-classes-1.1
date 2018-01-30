class Counter extends HTMLElement {
  let x = 0;
  let clicked = () => void(x++, window.requestAnimationFrame(render));
  let render = () => (this.textContent = x.toString());

  constructor() {
    super();
    this.onclick = clicked;
  }

  connectedCallback() { render(); }

  static {
    window.customElements.define('num-counter', this);
  }
}
