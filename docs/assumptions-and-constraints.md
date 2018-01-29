# Assumptions and Constraints

## Assumptions

We assume that either per-instance or per-class encapsulation is a required feature for Classes 1.1. We assume a strong preference for per-class encapsulation.

Using class-based encapsulation should be:

- Intuitive: it should avoid surprising behavior
- Approachable: it should look easy and fun
- Familiar: it should be similar to other encapsulation mechanisms in Javascript

## Constraints

Our solution space is considerably limited by path-dependencies that have arisen as a result of existing practice, Babel transformations, and compile-to-JS languages.

### C1. The current instance/class field syntax for public fields is taken

We can't change the semantics of field syntax without significant disruption to users of that syntax (e.g. React users). Furthermore, users expect the field syntax to be mere sugar over assignment within the constructor in order to relieve repetition of `this.propertyName` assignments.

- This constraint rules out implementing fields as accessors over private state.
- This constraint also forces us into accepting subclass "static field shadowing" behavior.

### C2. The `@` token is taken

We can't change the meaning of `@` without significant disruption to users of decorators (e.g. Angular/TypeScript users).

- This constraint rules out Ruby-style private member syntax.

### C3. Leading sigil field names are unacceptable to users

Given the usage of `private` in TypeScript, users have difficulty understanding the technical necessity of marking a private field with a leading sigil. Furthermore, TC39 has received a high volume of negative feedback regarding `#`-prefixed names.

  - This constraint rules out `#`-prefixed private field names.

## Additional Considerations

- The WeakMap model of private state works well for most use cases, including edge cases like "super-override".
- The primary syntactic mechanism in Javascript used for encapsulation is the lexical closure.
