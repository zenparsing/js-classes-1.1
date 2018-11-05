class Counter extends HTMLElement {
  let x = 0;

  let clicked = () => {
    this::x++;
    window.requestAnimationFrame(() => render());
  }

  let render = () => {
    this.textContent = this::x.toString();
  }

  onclick = () => clicked();

  connectedCallback() {
    render();
  }
}

window.customElements.define('num-counter', Counter);
