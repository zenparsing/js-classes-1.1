# Technical Notes and Rationale

## Hidden Names

- Hidden names are lexically scoped to the body of the class definition that defines the hidden name.
- Hidden names exist in a separate namespace from normal lexical declarations. A hidden name never shadows or clashes with a normal lexical declaration.
- Conceptually, the bound value of a hidden name is the definition of that name provided by the class body.
- Hidden names are only accessible using the `->` operator.
- The semantics of `->` is to create an ECMAScript Reference type value whose base component is the left operand of `->` and whose reference name component is the lexically bound value of the hidden name that is the right operand. Note that this is a new form of Reference.
- The left operand of `->` must be object coercible and supplies the object context for the reference. For a reference to an instance variable the reference base is the object whose instance variable state is being accessed.  For a reference to a hidden method the reference base is the `this` value that will be passed when the method is invoked.
- Hidden names (instance variables and hidden methods) exist in the same namespace, so an instance variable may not have the same name as a hidden method.
- The kind of thing a hidden name is bound to is based upon its declaration. We can statically determine from the supplied name whether `->` is accessing an instance variable, a hidden accessor method, or invoking a hidden method.

## Instance Variables

- Instance variables provide per-instance state that is only accessible to code that is defined within the body of a class definition.
- Instance variables are not object properties and have minimal semantic overlap with properties. They do not have attributes. They are not accessible via prototype lookup. They generally<sup>1</sup> may not be dynamically added after their construction is completed. They may not be deleted. We think it is very important that JS programmer develop a conceptual model of objects that does not confuse or conflate instance variables and own properties.
- Instance variables are declared via a distinct class body element (a `var` definition) and a distinct access operator (`->`) in order to conceptually distance them from the concept of object properties.
- Instance variables are not visible to any existing reflection mechanisms and instance variable accesses are not
trapped by ECMAScript Proxies.
- `var` is repurposed to declare instance variables because its name is suggestive of "instance VARiable". Note that several early ES class proposals including the original ES4 proposals used `var` for this purpose.
- Instance variable declarations do not have initializers because initializers would add significant complexity.  Without initializers, we don't have to define their evaluation order or the scoping of the initializer expressions. JS developers are already used to using constructors to initialize per-instance properties; initializing instance variables in the constructor should seem natural to them.
- Static instance variables are not supported. Technically it would be possible, but experience with previous proposals suggests that the natural semantics of static instance variables is unintuitive and confusing to many JS programmers. Because we want conceptual simplicity, we think it is better to leave them out. For use cases where a static instance variable would make sense roughly the same semantics an be obtained by using a lexical binding that is external to the class definition.
- The `var` declarations of a class definition collective and statically defined the "shape" of the hidden instance variable state introduced by that class definition. This "shape" can also be conceptualized as a group consisting of all the instance variables defined by a specific class definition.
- When code attempts to access an instance variable of an object the access semantics must verify that the object state actually includes the instance variable group for that object. One way for an implementation to identify an instance variable group is by assigning a unique "brand" to each group and check for that brand on each instance variable access. This can be easily optimized with local flow analysis, since all instance variables in a group share the same brand, only the first access in a method must be checked.
- A subclass that declares instance variables adds an additional instance variable group to the object returned from its `super` constructor call. The code in the subclass body only has visibility to the instance variables it defines.

## Hidden Methods

- A hidden method definition is simply a class body concise method definition that is prefixed by the keyword `hidden`.
- Any  concise method form including `static` methods and accessor methods may be used to define a hidden method.  It's the `hidden` prefix to the concise method definition that makes it a hidden method.
- Hidden methods don't have any special semantics for their bodies. The Home object of a hidden method is set exactly the same way it would be set if the `hidden` prefix was absent.
- Like all other methods, hidden method invocations are not brand checked.  Any method or function defined in a class body, not just hidden methods, may access the instance variables defined in that body. Brand checking instance variables would not introduce any additional instance variable access protection or safety as instance variable accesses are themselves brand checked.
- It is an early error to assign to a hidden method reference (unless it is an accessor method).
- Because hidden methods are statically resolvable and have immutable bindings, it is easy for an implementation to statically in-line them.  No flow analysis or dynamic specialization is required.

## Static Initializers

- The essential functionality provided by static initializers is the ability for a class definition to export functions that access hidden names into its enclosing lexical scope.  This permits construction of abstractions that permit sharing (i.e. friend access) among a group of related class definitions.
- Static initializers also support encapsulation of static data property definitions and the freezing or sealing of the class.

<sup>1</sup>Kevin's apparatus is a way to use class definitions to add a group of instance variables to an already constructed object:

```js

function IdentityConstructor(o) {
  // new IdentifyConstructor(o) just returns o
  return o;
}


let addSlot = x => class extends IdentityConstructor(x) {
  var slot;
  constructor() {
    super();
    return {
       get slot() { return x->slot },
       set slot(v) { x->slot = v }
    };
  }
}
```
