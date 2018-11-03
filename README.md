# proposal-class-members
This is a fork of the rejected js-classes-1.1 proposal aimed to pick up development where the previous proposal left off. Since the original was shot down due to the absense of a syntax for declaring public data members, that is one of the first things remedied by this fork. Along with a few syntax improvements for readability, the main goal is to provide TC39 with a proposal capable of providing everything demanded by the board without negatively impacting any features or natural integration expectations currently in the language.

## Motivation

This is a new proposal for extending ECMAScript's class definition syntax and semantics. It is intended to be a replacement for the  set of proposals currently under development within TC39. For the motivation behind developing a new proposal, see *[why a new proposal](docs/motivation.md)*.

## Philosophy
Elements of a `class` definition should only appear on direct products of the `class` keyword. This means that if it's not on the prototype, on the constructor, or (as of this proposal) part of the closure definition, it's not a member of the `class` definition, and therefore, not a member of the class. A class "member" is therefore anything defined or produced within the lexical scope of the `class` definition and represented in on of the products of `class`.

## Goals

The max-min class design, as implemented in ECMAScript 2015, has successfully balanced the need for a declarative class syntax with the desire to keep semantics lightweight and expressible in terms of the existing JavaScript object model. Although there are currently several proposals for extending class definitions with additional features, we believe that existing class definitions are only missing the following fundamental capabilities:

1. **Per-instance encapsulated state.** There should be a way for a class author to specify per-instance state that is not accessible outside of the class definition.
2. **Secure method decomposition.** There should be a way for the user to refactor common code into methods that are not accessible outside of the class definition.
3. **Customized data initialization.** There should be a way to initialize the class prototype, for instance by adding arbitrary data properties, within the class definition.

## Overview

This proposal adds the concept of an instance closure to ECMAScript class definitions. Much as with calling a function, creation of a new instance also triggers the creation of an instance closure. Declarations in the `class` definition beginning with `let` or `const` are directly executed inside the closure during this creation process. These closed-over instance-variables become the hidden instance-state of the new instance. 

There are four kinds hidden class members:

### Instance Variables

An instance variable definition defines one or more hidden variables that exist as part of the state of each instance of a class. Within a class body, instance variables are accessed either directly by name if they have not been shadowed, or via the `::` operator. Instance variables are declared with the `let` keyword.

```js
class Point {
  // Instance variable definition
  let x, y;

  constructor(x, y) {
    // Instance variables are accessed
    // with the "::" operator
    this::x = x;
    this::y = y;
  }
}
```

Instance variable names are lexically scoped and visible to everything (including nested functions and class definitions) contained in a class body.

Attempting to access an instance variable using `::` produces a runtime `ReferenceError` if the left operand is not an object posessing a closure with a definition aware of the current execution context. In other words, a reference to an instance variable only works when the object is a normally constructed instance of this class or one of its subclasses.

Instance variable definitions may have initializers. The absense of an initializer is equivalent to being initialized with `undefined`. The value of an initializer is determined at the time the `class` definition is parsed. Instance-specific value assignments can only be performed in the constructor.

### Instance Constants

An instance constant is defined using the `const` keyword. As constants, they must have an initializer. Beyond these 2 points, everything that is true for instance variables is also true for instance constants.

### Class Variables & Constants

For each of the 2 kinds above, there is a static equivalent. Hidden static members are defined by placing the `static` keyword as the 2<sup>nd</sup> term of the definition.

```js
class A {
  const static field1 = Symbol('field1');
  let static field2;
  ...
}
```

Hidden static members are placed in a separate closure attached to the constructor function. Such members can be accessed via the `::` operator with the constructor function itself as the target object.

### Hidden Methods

No direct syntax support will be available for creating hidden methods. However, since a variable can hold anything, a function expression is a valid initializer. If the function expression is an arrow function, it automatically inherits the context object of the instance-closure. Otherwise, the function will operate in accordance with the existing rules for all nested functions declared using the `function` keyword.

### Public Data Properties

A public data property is declared in exactly the same fashion as an instance variable, but without the `let` prefix. Public data properties are placed on the prototype and initialized with undefined if no initializer is given, or the value of the initializer at the time the `class` definition is evaluated. Likewise, static public data properties can be created by prefixing a public data property with the `static` keyword.

```js
class A {
  prop3 = 42;
  static prop4;
  ...
}
```

### Instance Closures

The `class` keyword will, depending on the definition, produce up to 2 more products. Should the definition contain hidden static members, a closure containing these definitions will be produced, executed, and attached to the constructor function object. This closure definition will include a reference to each of the functions present as own properties of either the prototype or the constructor at the time of execution of the `class` definition.

Should the definition contain hidden non-static members, a closure definition will be produced and attached to the constructor function object. This closure definition will include a reference to each of the functions present as own properties of the prototype at the time of execution of the `class` definition. Upon instantiation, immediately following the attaching of the prototype to the new instance, the closure definition will be executed and the resulting closure will be attached to the new instance.

When a closure-referenced function is run with the closure's instance as its context, that closure is placed at the top of the scope chain just before adding the lexical scope of the called function itself.

### Additional Notes

It is an early error if the name occurring to the right of a `::` operator is not the lexically visible name of a hidden method or instance variable.

It is an early error if duplicate hidden names are defined within a single class definition and the names do not reference a get/set accessor pair.

Reflection is not supported on instance variables, instance variable names, hidden methods, or hidden method names.

Lexically scoped instance variable declarations and hidden method definitions introduce new names into a parallel scope. Hidden names do not shadow non-hidden names.

### More

- [Code examples](https://github.com/rdking/proposal-class-members/tree/master/examples)
- [Technical notes and rationale](docs/rationale.md)
- [Assumptions and constraints](docs/assumptions-and-constraints.md)
- [A refactoring example](docs/refactoring.md)
- [Why not fields?](docs/why-not-fields.md)
- [Specification text](https://zenparsing.github.io/js-classes-1.1/)
