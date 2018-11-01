class Counter extends HTMLElement {
  let x = 0;

  let clicked = () => {
    x++;
    window.requestAnimationFrame(() => render());
  }

  let render = () => {
    this.textContent = x.toString();
  }

  onclick = () => clicked();

  connectedCallback() {
    render();
  }
}

window.customElements.define('num-counter', Counter);
