class Counter extends HTMLElement {
  var x;

  constructor() {
    super();
    x = 0;
    this.onclick = () => this->clicked();
  }

  connectedCallback() {
    this->render();
  }

  hidden clicked() {
    x++;
    window.requestAnimationFrame(() => this->render());
  }

  hidden render() {
    this.textContent = x.toString();
  }

  static {
    window.customElements.define('num-counter', this);
  }
}
