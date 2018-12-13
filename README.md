# proposal-class-members
This is a fork of the rejected js-classes-1.1 proposal aimed to pick up development where the previous proposal left off. Since the original was shot down due to the absense of a syntax for declaring public data members, that is one of the first things remedied by this fork. Along with a few syntax improvements for readability, the main goal is to provide TC39 with a proposal capable of providing everything demanded by the board without negatively impacting any features or natural integration expectations currently in the language.

## Motivation

This is a new proposal for extending ECMAScript's class definition syntax and semantics. It is intended to be a replacement for the  set of proposals currently under development within TC39. For the motivation behind developing a new proposal, see *[why a new proposal](docs/motivation.md)*.

## Philosophy
Elements of a `class` definition should only appear on direct products of the `class` keyword. This means that if it's not on the prototype, on the constructor, or (as of this proposal) part of the private container definition, it's not a part of the `class` definition, and therefore, not a member of the class. A class "member" is therefore anything defined or produced within the lexical scope of the `class` definition and represented in one of the products of `class`.

## Goals

The max-min class design, as implemented in ECMAScript 2015, has successfully balanced the need for a declarative class syntax with the desire to keep semantics lightweight and expressible in terms of the existing JavaScript object model. Although there are currently several proposals for extending class definitions with additional features, we believe that existing class definitions are only missing the following fundamental capabilities:

1. **Per-instance encapsulated state.** There should be a way for a class author to specify per-instance state that is not accessible outside of the class definition.
2. **Secure method decomposition.** There should be a way for the user to refactor common code into methods that are not accessible outside of the class definition.
3. **Customized data initialization.** There should be a way to initialize the class prototype, for instance by adding arbitrary data properties, within the class definition.

## Overview

This proposal borrows the concept of private symbols, as proposed [here](https://github.com/zenparsing/proposal-private-symbols), but there are a few differences. Private symbols will not be directly accessible to user-land code at all. `Object.assign` and operator `...` will not be affected by the private symbol implementation, as they only affect enumerable keys. `Object.seal` will not be affected by the private symbol implementation, as the private container is sealed immediately after initialization. `Object.freeze` will not be affected by the private symbol implementation, as it doesn't currently affect accessor properties, which remain the only "values" exposed on the object that may still change value after freezing.

Many attempts to create a form of data privacy have been attempted, but all save for private-symbols have failed to create privacy in a way that preserves the functionality of Proxy in the presence of private data. However, private-symbols introduces limitations of its own. Due to the fact that private symbols are themselves 1st class values in ES, developers would have the ability to monkey-patch code containing private symbols and expose the corresponding properties to the public. This is a violation of hard private, but not one that is insurmountable. With this proposal, private symbols are a mere implementation detail that provides the ability to create properties who's name is unknown and unretrievable on any object. Using this capability, the engine will be able to hide data on an object without fear that a developer can manipulate that data through any means other than provided for in this document.


### New products of `class`
Both the constructor, and prototype will have additional properties as result of this proposal:

#### Constructor -
* Symbol.private("Signature") - This property contains a private symbol value used to passively perform basic brand checking. The value of this symbol is the key name for the private container created by the private initializer. This is the "class signature".
* [Constructor[Symbol.private("Signature")]] - This property contains a private container object created by the private initializer of a constructor. It holds data properties and methods that were declared private and static in the `class` definition.

#### Prototype -
* Symbol.private("Initializer") - This property is a function, similar to the constructor itself, and run by the constructor as the first instruction following "super". It's purpose is to create the private container on the instance and initialize the properties of that container to the specified values. The key name for this private container is the class signature. This function also creates a similar container on the constructor using the same class signature, to contain any static private data that has been declared.

#### Additionally, the following property can appear on instances:
* [Constructor[Symbol.private("Signature")]] - This property contains a private container object created by the private initializer of a constructor. It holds data properties and methods that were declared private and static in the `class` definition.


### Instance-Private Properties

An instance-private property definition defines one or more properties that exist in one of the private containers on an instance of the class. Within a class body, instance-private properties are accessed via the `::` operator. Instance-private properties are declared with the `priv` keyword.

```js
class Point {
  // Instance-Private property definition
  priv x = 0;
  priv y;

  constructor(x, y) {
    // Instance-private properties are accessed
    // with the "::" operator
    this::x = x;
    this::y = y;
  }
}
```

Attempting to access an instance-private property using `::` produces a runtime `ReferenceError` if the class signature of the current execution context does not exist as a property of the instance object that is the left operand. In other words, a reference to an instance-private property only works when the object has been initialized by the constructor of the class owning the function making the access.

Instance-private property definitions may have initializers. The absense of an initializer is equivalent to being initialized with `undefined`. The value of an instance-private property's initializer is determined at the time an instance is initialized.

### Class-Private Properties

The static equivalent of an instance-private property is a class-private property. Class-private properties are defined by placing the `static` keyword as the 2<sup>nd</sup> term of the definition.

```js
class A {
  priv static field1 = Symbol('field1');
  priv static field2;
  ...
}
```

Class-private properties are placed in a private container on the constructor function. Such members can be accessed via the `::` operator with the constructor function itself as the target object.

### Instance-Private Methods

Instance-private methods will have the same format as public methods, preceeded by `priv`. It is also possible to assign a function to a private data property. However, such functions will not be granted the class signature. It is not reasonable to expect the private initializer to be able to distinguish between initialization values that are external to the `class` definition and values defined inside the `class`. Therefore all such functions will be treated as external and left unsigned, even if they are defined inside the `class` lexical scope.

```js
class A {
  priv member() { /* is a signed member function */ }
  priv nonMember = () => {
    /*
      This one is a non-member and cannot access private members, even though
      it is declared inside the class lexical scope. It does, however, still
      automatically receive the `this` instance as its context.
    */
  }
  priv nonMember2 = function() {
    /*
      This one has the same restrictions as nonMember, except that it does not
      automatically receive the `this` instance as its context. It might as
      have been defined outside of the `class`.
    */
  }
}
```

### Public Data Properties

A public data property is declared in exactly the same fashion as an instance variable, but without the `priv` prefix. Public data properties are placed on the prototype and initialized with undefined if no initializer is given, or the value of the initializer at the time the `class` definition is evaluated. Likewise, static public data properties can be created by prefixing a public data property with the `static` keyword.

```js
class A {
  prop3 = 42;
  static prop4;
  ...
}
```

### `class` Products

Beyond the constructor and the prototype, the `class` keyword will, depending on the definition, produce up to 3 more products.
* If the class contains no member definitions prefixed with `priv`, no additional products will be produced.
* If `priv` members exist, `class` will produce at minimum a class signature applied to all functions of the class, including the constructor.
* If there are any `priv static` members, the `class` keyword will also produce a private container on the constructor.
* If there are any `priv` members that are not `static`:
    * The `class` keyword will produce a private initializer function attached to the prototype.
    * The private initializer function will produce a private container on the instance.

Upon instantiation of the class, immediately following the return of the new instance from the base class, the private initializer will be executed.

When a function that accesses the private members of the context object is called, the context object is cheked to see if it has a property whose name matches the class signature of that function prior to the execution of the function. The same test is performed for each access of a private member of an object that is not the current context. These 2 checks guarantee that no access to private members can be performed from an inappropriate execution context, or using an inappropriate context object. This is _brand-checking_ as defined by this proposal.

### Additional Notes

It is an early error if left hand argument (LHA) of a `::` operator is not an object with private members.

It is an early error if the class signature of the current execution context is not a property of the LHA of the `::` operator.

It is an early error if duplicate private member names are defined within a single class definition and the names do not reference a get/set accessor pair.

Reflection is not externally supported for any private member. It is not a goal of this proposal to support internal reflection, but it is likewise not precluded.

Private member names do not shadow public member names.

### More

- [Code examples](https://github.com/rdking/proposal-class-members/tree/master/examples)
- [Definitions & Technical Notes](docs/definitions.md)
- [Assumptions and constraints](docs/assumptions-and-constraints.md)
- [A refactoring example](docs/refactoring.md)
- [Why not fields?](docs/why-not-fields.md)
- [Specification text](https://rdking.github.io/proposal-class-members/)
- [Private Symbols Specification](https://github.com/zenparsing/proposal-private-symbols)