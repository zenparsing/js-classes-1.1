# Refactoring With Hidden Elements

In this document we will take a simple ECMAScript 2015 class definition for a DOM custom element and progressively refactor it to take advantage of the class extensions defined in this proposal.

## A Starting Point

We start with a plain ECMAScript 2015 class definition. It stores internal state in a publicly accessible data property named `xValue` and uses a few publicly accessible methods for internal code organization. The custom element constructor is registered with the DOM by calling `customElements.define` immediately after the class definition.

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

As the first step in our refactoring process, we will update the class definition so that internal state is stored in an *instance variable*. We add an instance variable declaration to the class using the `var` keyword and update references to this value using the hidden access operator `->`.

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

Next, we will convert our internal helper methods into *hidden methods* by adding the `hidden` modifier to method definitions and updating invocations of those methods to use the hidden access operator `->`.

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

Finally, we move the call to `customElements.define` inside the class definition by adding a *class initializer block*. The `this` value inside of a class initializer block refers to the constructor function of the class being defined.

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
