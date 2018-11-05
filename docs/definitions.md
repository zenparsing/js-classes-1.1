# Defintions and Technical Notes

## Closure Signatures

- A closure signature is a unique internal value generated whenever an instance closure definition or a class closure is generated.
- The closure signature is attached to every function and accessor declaration lexically scoped in the class definition. 
- The closure signature of the instance closure definition is attached to every instance closure created by instantiating the class.
- The closure signature is used to quickly check if a given function has access to a particular instance or class closure.

## Class Members

- A class member is an element of the set of all definitions lexically scoped witin a class definition.
- All class members become part of one of the products of a class definition: constructor, prototype, instance closures.
- Class members which become part of an instance closure are not properties of the class or its instances.

## Operator `::`

- Operator `::` is a "scope access operator" whose sole purpose is to provide access to the instance or class closure of an object from within a function sharing the same closure signature.
- Since operator `::` does not access a property of the instance, ECMAScript Proxies cannot trap this operation.

## Instance & Class Closures

- Instance & class closures are execution scopes containing the non-property declarations in a class definition.
- Instance closures contain non-static members and are attached to their target object immediately prior to the instance object becomming available as the context object of the constructor function.
- Class closures contain static members and are attached to the constructor during the evaluation of the class definition.
- Class closures are only generated if the set of members to include is not empty.
- Instance & class closures are added to the execution scope chain of member functions just before that function's own local scope.
- The instance or class closure added to a called member function is provided by the target instance.
- If the instance or class closure and the called member function do not share the same closure signature, the closure is not added to the scope chain.
- A Proxy is incapable of having an instance or class closure of its own. All operations against a Proxy involving instance or class closure access are immediately forwarded to the Proxy target. 

## Instance Closure Definitions

- Instance closure definitions are internal templates used to construct instance closures when `new` is used on a constructor posessing one.
- Instance closure definitions are created during the evaluation of a class definition and attached to the class constructor.
- Instance closure definitions are only generated if the set of members to include is not empty.

## Instance Variables

- Instance variables provide per-instance state that is only accessible to code that is defined within the body of a class definition.
- Instance variables are not object properties and have minimal semantic overlap with properties. They do not have attributes. They are not accessible via prototype lookup. They generally<sup>1</sup> may not be dynamically added after their construction is completed. They may not be deleted. We think it is very important that JS programmer develop a conceptual model of objects that does not confuse or conflate instance variables and own properties.
- Instance variables are declared via a distinct class body element (a `let` definition), and accessed via either a lexical name or a distinct access operator (`::`) in order to conceptually distance them from the concept of object properties.
- Instance variables can have initializers. The value of an initializer is statically determined at the time the class definition is evaluated. To initialize an instance variable to an instance-specific value, the constructor must be used. This should be no different from what ES developers are already accustomed to doing.
- Instance variables can hold functions. If the function is an arrow function, the function will inherit the instance object that the instance closure is attached to as its default context.
- Instance variables can be declared static using the `static` keyword after the `let` keyword. Static instance variables are collectively placed in a single class closure that is attached to the constructor function.
- Instance variables are not visible to any existing reflection mechanisms.
- Instance variable accesses are not trapped by ECMAScript Proxies.
- `let` is repurposed to declare instance variables because its semantic conceptually limits the declaration to within the `{}` of the class definition.
- The `let` declarations of a class definition collective and statically defined the "shape" of the instance closure definition introduced by that class definition. This "shape" can also be conceptualized as a group consisting of all the instance variables defined by a specific class definition.
- When code attempts to access an instance variable of an object the access semantics must verify that the object state actually includes the instance variable group for that object. One way for an implementation to identify an instance variable group is by assigning a unique "brand" to each group and check for that brand on each instance variable access. This can be easily optimized with local flow analysis, since all instance variables in a group share the same brand, only the first access in a method must be checked.
- A subclass that declares instance variables adds an additional instance variable group to the object returned from its `super` constructor call. The code in the subclass body only has visibility to the instance variables it defines.

## Instance Constants

- Instance constants are declared via a distinct class body element (a `const` definition), and accessed via either a lexical name or a distinct access operator (`::`) in order to conceptually distance them from the concept of object properties.
- Instance constants must have an initializer as their values cannot be changed by any code within the class.
- Beyond the first 2 points, everything that applies to an instance variable, also applies to an instance constant.

<sup>1</sup>Kevin's apparatus is a way to use class definitions to add a group of instance variables to an already constructed object:

```js
function IdentityConstructor(o) {
  // new IdentifyConstructor(o) just returns o
  return function () {
    return o;
  }
}

let addSlot = x => new class extends IdentityConstructor(x) {
  let slot;
  constructor() {
    super();
    return {
       get slot() { return x::slot },
       set slot(v) { x::slot = v }
    };
  }
}
```
