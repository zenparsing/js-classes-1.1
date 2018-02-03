class Counter extends HTMLElement {
  var x = 0;

  hidden clicked() {
    this->x++;
    window.requestAnimationFrame(() => this->render());
  }

  hidden render() {
    this.textContent = this->x.toString();
  }

  constructor() {
    super();
    this.onclick = () => this->bind();
  }

  connectedCallback() {
    this->render();
  }

  static {
    window.customElements.define('num-counter', this);
  }
}
