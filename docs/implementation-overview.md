# Implementation Overview

This proposal borrows the concept of private symbols, as proposed [here](https://github.com/zenparsing/proposal-private-symbols), but there are a few differences. Private symbols will not be directly accessible to user-land code at all. `Object.assign` and operator `...` will not be affected by the private symbol implementation, as they only affect enumerable keys. `Object.seal` will not be affected by the private symbol implementation, as the private container is sealed immediately after initialization. `Object.freeze` will not be affected by the private symbol implementation, as it doesn't currently affect accessor properties, which remain the only "values" exposed on the object that may still change value after freezing.

There have been many attempts to create a form of data privacy, but all save for private-symbols have failed to create privacy in a way that preserves the functionality of Proxy in the presence of private data. However, private-symbols introduces limitations of its own. Due to the fact that private symbols are themselves 1st class values in ES, developers would have the ability to monkey-patch code containing private symbols and expose the corresponding properties to the public. This is a violation of hard private, but not one that is insurmountable. 

With this proposal, private symbols are a mere implementation detail that provides the ability to create properties who's name is unknown and unretrievable on any object. Using this capability, the engine will be able to hide data on an object without fear that a developer can manipulate that data through any means other than provided for in this proposal.

## New products of `class`
Both the constructor, and prototype can have additional properties as result of this proposal:

#### Constructor -
* Symbol.private("Signature") - This property contains a private symbol value used to passively perform basic brand checking. The value of this symbol is the key name for the private container created by the private initializer. This is the "class signature".
* [Constructor[Symbol.private("Signature")]] - This property contains a private container object created by the private initializer of a constructor. It holds data properties and methods that were declared private and static in the `class` definition. This is the "class-closure".

#### Prototype -
* Symbol.private("Initializer") - This property is a function, similar to the constructor itself, and run by the constructor as the first instruction (following "super", if it exists). It's purpose is to create the instance-closure and initialize the properties of that container to the specified values. The key name for this private container is the class signature. This function also initializes any `inst` properties. This is the "private initializer".

#### Additionally, the following property can appear on instances:
* [Constructor[Symbol.private("Signature")]] - This property contains a private container object created by the private initializer of a constructor. It holds data properties and methods that were declared private and static in the `class` definition. This is the "instance-closure".


## Private Data Members

A private data member definition defines one or more properties that exist in one of the private containers on an instance of the `class`. Within a `class` body, private data members are accessed via the `::` operator. Private data members are declared with the `let` keyword.

```js
class Point {
  // Instance-Private property definition
  let x = 0;
  let y;

  constructor(x, y) {
    // Instance-private properties are accessed
    // with the "::" operator
    this::x = x;
    this::y = y;
  }
}
```

Attempting to access a private data member using `::` produces a runtime `ReferenceError` if the class signature of the current execution context does not exist as a property of the instance object that is the left operand. In other words, a reference to a private data member only works when the object has been initialized by the constructor of the class that defines the function making the access.

Private data member definitions may have initializers. The absense of an initializer is equivalent to being initialized with `undefined`. The value of an private data member's initializer is determined at the time an instance is initialized.

## Private Constant Data Members

There are only 2 significant differences between private data members and private constant data members. Private constant data members are declared with the `const` keyword. Also, they must be initialized in their declaration.

## Class-Private Members

The static equivalent of a private data member is a class-private data member. Class-private data members are defined by placing the `static` keyword as the 2<sup>nd</sup> term of the definition.

```js
class A {
  let static field1 = Symbol('field1');
  const static field2 = 0;
  ...
}
```

Class-private data members are placed in a class-closure on the constructor function. Such members can be accessed via the `::` operator with the constructor function itself as the target object.

## Private Member Functions

No direct syntax support will be available for creating private member functions. However, since a private data member can hold anything, using a function expression as an initializer creates a private member function. If the function expression is an arrow function, it is automatically bound to the context object of the instance-closure. Otherwise, the function will operate in accordance with the existing rules for all nested functions declared using the function keyword.

## Public Data Members

A public data member is declared in exactly the same fashion as a private data member, but without the `let` or `const` prefix. Public data properties are placed on the prototype and initialized with undefined if no initializer is given, or the value of the initializer at the time the `class` definition is evaluated. Likewise, static public data properties can be created by prefixing a public data property with the `static` keyword.

```js
class A {
  prop3 = 42;
  static prop4;
  ...
}
```

## `class` Products

Beyond the constructor and the prototype, the `class` keyword will, depending on the definition, produce up to 3 more products.
* If the class contains no member definitions prefixed with `priv`, no additional products will be produced.
* If `priv` members exist, `class` will produce at minimum a class signature applied to all functions of the class, including the constructor.
* If there are any `priv static` members, the `class` keyword will also produce a private container on the constructor.
* If there are any `priv` members that are not `static`:
    * The `class` keyword will produce a private initializer function attached to the prototype.
    * The private initializer function will produce a private container on the instance.

Upon instantiation of the class, immediately following the return of the new instance from the base class, the private initializer will be executed.

When a function that accesses the private members of the context object is called, the context object is cheked to see if it has a property whose name matches the class signature of that function prior to the execution of the function. The same test is performed for each access of a private member of an object that is not the current context. These 2 checks guarantee that no access to private members can be performed from an inappropriate execution context, or using an inappropriate context object. This is _brand-checking_ as defined by this proposal.

## Additional Notes

It is an early error if left hand argument (LHA) of a `::` operator is not an object with private members.

It is an early error if the class signature of the current execution context is not a property of the LHA of the `::` operator.

It is an early error if duplicate private member names are defined within a single class definition and the names do not reference a get/set accessor pair.

Reflection is not externally supported for any private member. It is not a goal of this proposal to support internal reflection, but it is likewise not precluded.

Private member names do not shadow public member names.
