# Proposal: Instance Variables

For background see [Assumptions and Constraints](../docs/assumptions-and-constraints.md).

## Syntax

Class bodies are extended to allow *instance variable declarations*.

```
ClassElementList:
  InstanceVariableDeclaration
  ...

InstanceVariableDeclaration:
  let InstanceVariableList ;

InstanceVariableList:
  InstanceVariableDefinition
  InstanceVariableList , InstanceVariableDefinition

InstanceVariableDefinition:
  BindingIdentifier Initializer?
```

Early errors prohibit duplicate instance variable binding names within a class body.

Example:

```js
class Point {
  let x = 0, y = 0;

  print() {
    console.log(`<${ x }, ${ y }`);
  }
}
```

Member expressions are extended to allow *instance variable member expressions*.

```
MemberExpression:
  MemberExpression .& Identitfier
  ..
```

Early errors prohibit an *instance variable member expression* from appearing as the operand of the **delete** operator.

Example:

```js
class Point {
  let x = 0, y = 0;

  equals(otherPoint) {
    return x === otherPoint.&x && y === otherPoint.&y;
  }
}
```

## Semantics

### Class Definition Evaluation

When a class definition is evaluated, an *instance variable definition list* is generated. Each record in the list contains a binding name, a unique *instance variable key*, and an optional initializer expression.

During class definition evaluation, an *instance variable definition environment* is created with **uninitialized** bindings for each instance variable binding identifier contained in the *instance variable definition list*. These bindings are never initialized.

> This ensures that a ReferenceError is thrown if the program attempts to reference an instance variable binding from outside of a prototype method.

Example:

```js
class Point {
  let x;
  static f() { return x } // ReferenceError
}
```

We assume the existence of a mapping function **MapInstanceVariableName** from identifiers to non-identifier names. For each instance variable binding name in the *instance variable definition list*, we populate the *instance variable definition environment* with an immutable binding whose binding name is the result of calling **MapInstanceVariableName** on the instance variable name and whose value is the instance variable's *instance variable key*.

> These bindings are accessed only during the evaluation of instance variable member expressions.

The *instance variable definition list* is stored in an internal slot on the class prototype object.

### Instance Variable Initialization

Objects contain a possibly empty *instance variable list*. Each entry in the *instance variable list* is a record that contains an *instance variable key* and a value. The *instance variable list* is used to store the current values of the object's instance variables.

Immediately before the `this` value is bound to a function environment record within **SuperCall** evaluation and `[[Construct]]`, if the current function has a `[[HomeObject]]` and the `[[HomeObject]]` has a non-empty *instance variable definition list*, we perform the following operation:

For each entry in the *instance variable definition list*:

- If the entry contains an initializer expression, evaluate the expression in the *instance variable environment* of the current execution context (defined below).
- Add an entry to the object's *instance variable list* containing the *instance variable key* and the result of evaluating the initializer expression or **undefined**.

> Evaluating initializers within the execution context's instance variable environment ensures that initializers have access to the values of other instance variables that have already been initialized.

> Accessing the "this" value within an initializer expression will throw a ReferenceError

### Method and Constructor Invocation

When a function environment is created, if the function object has a`[[HomeObject]]` and the `[[HomeObject]]` has a non-empty *instance variable definition list*, we create an *instance variable lexical environment* whose environment record is an *instance variable environment record*. The *instance variable environment record* is initialized with bindings for each instance variable name. We set the *instance variable environment* of the current execution context to the *instance variable lexical environment*.

> The instance variable lexical environment ensures that closures created within the constructor and prototype methods close over the both the "this" value and the instance variable binding name.

### Instance Variable Environment Records

An *instance variable environment record* contains a reference to the function environment record of the currently executing function. It implements the following semantics:

#### GetBindingValue(name)

- Let *functionEnvRec* be the function environment record for this environment.
- Let *thisValue* be ? *functionEnvRec*.GetThisBinding().
- Let *instanceVarKey* be the value bound to *name*.
- Let *instanceVarList* be *thisValue*.[[InstanceVariableList]].
- For each record *entry* in *thisValue*.[[InstanceVariableList]].
  - If *entry*.[[InstanceVariableKey]] matches *instanceVarKey*
    - Return *entry*.[[InstanceVariableValue]]
- Throw a **ReferenceError**.

#### SetBindingValue(name, value)

- Let *functionEnvRec* be the function environment record for this environment.
- Let *thisValue* be ? *functionEnvRec*.GetThisBinding().
- Let *instanceVarKey* be the value bound to *name*.
- Let *instanceVarList* be *thisValue*.[[InstanceVariableList]].
- For each record *entry* in *thisValue*.[[InstanceVariableList]].
  - If *entry*.[[InstanceVariableKey]] matches *instanceVarKey*
    - Set *entry*.[[InstanceVariableValue]] to *value*.
- Throw a **ReferenceError**.

#### DeleteBinding(name)

- Throw a ReferenceError.

### Instance Variable Member Expressions

To evaluate an expression of the form `x .& y` we attempt to resolve a binding whose name is the result of calling **MapInstanceVariableName** on the string value of the right operand. If a binding is not found we throw a **ReferenceError**. Otherwise, we return an *instance variable reference* whose *base* component is the result of evaluating the left operand and whose *name* component is the resolved *instance variable key*.

When **GetValue** is called on an *instance variable reference*, we perform the following operations:

- Let *instanceVarKey* be the GetReferencedName(*V*).
- Let *instanceVarFound* be **false**.
- For each record *entry* in *base*.[[InstanceVariableList]].
  - If *entry*.[[InstanceVariableKey]] matches *instanceVarKey*
    - Return *entry*.[[InstanceVariableValue]].
- Throw a **ReferenceError**.

When **SetValue** is called on an *instance variable reference*, we perform the following operations:

- Let *instanceVarKey* be the GetReferencedName(*V*).
- Let *instanceVarFound* be **false**.
- For each record *entry* in *base*.[[InstanceVariableList]].
  - If *entry*.[[InstanceVariableKey]] matches *instanceVarKey*
    - Set *entry*.[[InstanceVariableValue]] to *value*.
    - Let *instanceVarFound* be **true**.
- If *instanceVarFound* is **false** throw a **ReferenceError**.
