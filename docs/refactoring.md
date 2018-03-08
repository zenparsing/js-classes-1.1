# Refactoring With Hidden Elements

## A Starting Point

```js
class Counter extends HTMLElement {
  get x() { return this.xValue; }
  set x(value) {
    this.xValue = value;
    window.requestAnimationFrame(this.render.bind(this));
  }

  clicked() {
    this.x++;
  }

  constructor() {
    super();
    this.onclick = this.clicked.bind(this);
    this.xValue = 0;
  }

  connectedCallback() { this.render(); }

  render() {
    this.textContent = this.x.toString();
  }
}
window.customElements.define('num-counter', Counter);
```

## 1. Instance Variables

```js
class Counter extends HTMLElement {
  var xValue;

  get x() { return this->xValue; }
  set x(value) {
    this->xValue = value;
    window.requestAnimationFrame(this.render.bind(this));
  }

  clicked() {
    this.x++;
    window.requestAnimationFrame(this.render.bind(this));
  }

  constructor() {
    super();
    this.onclick = this.clicked.bind(this);
    this->xValue = 0;
  }

  connectedCallback() { this.render(); }

  render() {
    this.textContent = this.x.toString();
  }
}
window.customElements.define('num-counter', Counter);
```

## 2. Hidden Methods

```js
class Counter extends HTMLElement {
  var xValue;

  hidden get x() { return this->xValue; }
  hidden set x(value) {
    this->xValue = value;
    window.requestAnimationFrame(this->render.bind(this));
  }

  hidden clicked() {
    this->x++;
    window.requestAnimationFrame(this->render.bind(this));
  }

  constructor() {
    super();
    this->xValue = 0;
    this.onclick = this->clicked.bind(this);
  }

  connectedCallback() { this->render(); }

  hidden render() {
    this.textContent = this->x.toString();
  }
}
window.customElements.define('num-counter', Counter);
```

## 3. Class Initializer Block

```js
class Counter extends HTMLElement {
  var xValue;

  hidden get x() { return this->xValue; }
  hidden set x(value) {
    this->xValue = value;
    window.requestAnimationFrame(this->render.bind(this));
  }

  hidden clicked() {
    this->x++;
    window.requestAnimationFrame(this->render.bind(this));
  }

  constructor() {
    super();
    this->xValue = 0;
    this.onclick = this->clicked.bind(this);
  }

  connectedCallback() { this->render(); }

  hidden render() {
    this.textContent = this->x.toString();
  }

  static {
    window.customElements.define('num-counter', this);
  }
}
```
