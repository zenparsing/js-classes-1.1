# proposal-class-members
This is a fork of the rejected js-classes-1.1 proposal aimed to pick up development where the previous proposal left off. Since the original was shot down due to the absense of a syntax for declaring public data members, that is one of the first things remedied by this fork. Along with a few syntax improvements for readability, the main goal is to provide TC39 with a proposal capable of providing everything demanded by the board without negatively impacting any features or natural integration expectations currently in the language.

## Constraints
For this proposal, and any others I may release, the following constraints are considered absolute requirements. The proposal must:

* achieve the desired functionality
* feel like regular ES code
* be maximally compatible with all existing language features
* be minimally conflicting with other, non-competing proposals
* be maximally extensible for future related concepts
* require as few trade-offs as possible
* preserve the "prototype-based" nature of the language,
* leave adequate room to ensure that what is sugar has a reasonably sugar-free equivalent

## Motivation

This is a new proposal for extending ECMAScript's class definition syntax and semantics. It is intended to be a replacement for the  set of proposals currently under development within TC39. For the motivation behind developing a new proposal, see *[why a new proposal](docs/motivation.md)*.

## Philosophy
Elements of a `class` definition should only appear on direct products of the `class` keyword. This means that if it's not on the prototype, on the constructor, or (as of this proposal) part of the private container definition, it's not a part of the `class` definition, and therefore, not a member of the class. A class "member" is therefore anything defined or produced within the lexical scope of the `class` definition and represented in one of the products of `class`.

## Goals

The max-min class design, as implemented in ECMAScript 2015, has successfully balanced the need for a declarative class syntax with the desire to keep semantics lightweight and expressible in terms of the existing JavaScript object model. Although there are currently several proposals for extending class definitions with additional features, we believe that existing class definitions are only missing the following fundamental capabilities:

1. **Per-instance encapsulated state.** There should be a way for a class author to specify per-instance state that is not accessible outside of the class definition.
2. **Secure method decomposition.** There should be a way for the user to refactor common code into methods that are not accessible outside of the class definition.
3. **Customized data initialization.** There should be a way to initialize the class prototype, for instance by adding arbitrary data properties, within the class definition.

## Mental Model

The only thing in ES that is capable of providing the 3 goals above is a closure. However, it is virtually impossible to use a closure to provide for per-instance state without the use of one or more WeakMaps. This proposal offers the concept of instance-specific closures to contain the private data. Each time a new instance is created, a new closure is created along with it and attached to all of the lexically scoped methods of the `class` definition.

Just as the closure of a function provides for lexically scoped variables, the public and private members of the instance become available as lexically scope variables. It's possible for locally scoped variable to shadow these property-variables. However, the properties are always available via `obj.member` for public members and `obj::member` for private members. Equivalent array notation is also available via `obj['member']` and `obj::['member']`, respectively.


## Links

- [Implementation Overview](docs/implementation-overview.md)
- [Code examples](https://github.com/rdking/proposal-class-members/tree/master/examples)
- [Definitions & Technical Notes](docs/definitions.md)
- [Assumptions and constraints](docs/assumptions-and-constraints.md)
- [A refactoring example](docs/refactoring.md)
- [Why not fields?](docs/why-not-fields.md)
- [Specification text](https://rdking.github.io/proposal-class-members/)
- [Private Symbols Specification](https://github.com/zenparsing/proposal-private-symbols)