# Javascript Classes 1.1

## Motivation

This is new proposal for extending ECMAScript class definition syntax and semantics. It is intend to be a replacement for the  set of proposals currently under development within TC39. For the motivation behind developing a new proposal see [Why A new Proposal](docs/motivation.md).

## Goals

The max-min class design, as implemented in ECMAScript 2018, has successfully balanced the need for a declarative class syntax with the desire to keep semantics lightweight and expressible in terms of the existing Javascript object model. Although there are currently several proposals for extending class definitions with additional features, we believe that existing class definitions are only missing the following fundamental capabilities:

1. **Per-instance encapsulated state.** There should be a way for a class author to specify per-instance state that is not accessible outside of the class definition.
1. **Secure method decomposition.** There should be a way for the user to refactor common code into methods that are not accessible outside of the class definition.
1. **Customized constructor initialization.** There should be a way to initialize the class constructor function, for instance by adding arbitrary data properties, within the class definition.

## Overview

This proposal adds the concept of hidden class elements to ECMAScript class definitions. Hidden class elements are only accessible from within the body of a class definition.

There are three kinds hidden class elements:

### 1. Instance Variables

A instance variable definition defines one or more hidden variables that exist as part of the state of each instance of a class.

Within a class body, instance variables are accessed using the `->` operator.

```js
class Point {
  // Instance variable definition
  var x, y;

  constructor(x, y) {
    // Instance variables are accessed
    // with the "->" operator
    this->x = x;
    this->y = y;
  }
}
```

Instances variable names are lexically scoped and visible to everything (including nested functions and class definitions) contained in a class body.

Attempting to access an instance variable using `->` produces a runtime `ReferenceError` if the left operand is not an object with the specific named instance variable defined by this class definition. In other words, a reference to an instance variable only works when the object is a normally constructed instance of this class or one of its subclasses.

Instance variable definitions don't have initializers. Instance variables are usually initialized by the constructor. An uninitialized instance variable has the value `undefined`.

### 2. Hidden Methods

A hidden method definition is a method that can only be directly invoked from inside the class body.

Within a class body, hidden methods are invoked using the `->` operator.

```js
class Spaceship {
  // A hidden method definition
  hidden flyTo(destination) {
    // Blast off!
  }

  flyToMoon() {
    // Hidden methods are invoked
    // using the "->" operator
    this->flyTo(Location.MOON);
  }
}
```

Like any other method, hidden methods can be accessors and may contain `super` property references.

A hidden method definition may be prefixed by the `static` keyword.

Hidden method names are lexically scoped and visible to everything contained in a class body.

Hidden methods can be accessed or invoked with any object supplied to the left of the `->`. It is up to the code of the method body whether or not a runtime error will occur if the `this` value is not an instance of the containing class or one of its subclasses.

### 3. Class Initializers

A class definition may contain at most one class initializer. If present, it is automatically executed as the final step of class definition evaluation.

```js
class MyElement extends HTMLElement {
  // A class initializer
  static {
    customElements.define('my-element', this);
  }
}
```

There is no way to invoke the class initializer from outside of the class definition.

Within a class initializer, the `this` value is bound to the class constructor and `super` property references are allowed.

### Additional Notes

It is an early error if the name occurring to the right of a `->` operator is not the lexically visible name of a hidden method or instance variable.

It is an early error if duplicate hidden names are defined within a single class definition and the names do not reference a get/set accessor pair.

Reflection is not supported on instance variables, instance variable names, hidden methods, or hidden method names.

Lexically scoped instance variable declarations and hidden method definitions introduce new names into a parallel scope. Hidden names do not shadow non-hidden names.

### More

- [Code examples](https://github.com/zenparsing/js-classes-1.1/tree/master/examples)
- [Initial proposal and discussion](https://github.com/zenparsing/js-classes-1.1/issues/7)
- [Assumptions and constraints](docs/assumptions-and-constraints.md)
- [A Refactoring Example](docs/refactoring.md)
- [Specification text](https://zenparsing.github.io/js-classes-1.1/)
