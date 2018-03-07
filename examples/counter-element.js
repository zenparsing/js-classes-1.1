class Counter extends HTMLElement {
  var x;

  constructor() {
    super();
    this::x = 0;
    this.onclick = () => this::clicked();
  }

  connectedCallback() {
    this::render();
  }

  hidden clicked() {
    this::x++;
    window.requestAnimationFrame(() => this::render());
  }

  hidden render() {
    this.textContent = this::x.toString();
  }

  static {
    window.customElements.define('num-counter', this);
  }
}
