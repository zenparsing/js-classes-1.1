class Counter extends HTMLElement {
  var x;

  hidden clicked() {
    this->x++;
    window.requestAnimationFrame(() => this->render());
  }

  hidden render() {
    this.textContent = this->x.toString();
  }

  constructor() {
    super();
    this->x = 0;
    this.onclick = () => this->clicked();
  }

  connectedCallback() {
    this->render();
  }

  static {
    window.customElements.define('num-counter', this);
  }
}
