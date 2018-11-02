# Why Not Fields?

> Public fields (including `static` public) are widely requested by the community, and the proposed semantics are simple and readily implementable. Why should we withdraw the proposal?

On an object-model level, JavaScript has no such thing as "fields". There are properties and there are "internal slots" (i.e. instance variables). When we attempt to clump them together under a single unifying concept named "fields" we end up with various problems. For example:

- Static private fields don't work because of the prototype/TypeError issue.
- Private methods are kind of like properties (e.g. they can be accessors) but kind of like internal slots (e.g. they throw TypeErrors). Which are they?
- Semantic forking between `obj.#x` and `obj['#x']`.
- Leakage and complexity when decorators are applied to private fields and methods.

The fields proposal conflates two *very* different things into a single syntactic declarator: private non-inherited, strictly encapsulated per-instance state, and public own properties. They have very different semantics and conflating them is a significant source of inessential complexity and conceptual confusion.

When we conflate own properties and hidden per-instance state into into a single keyword-less declarator, it forces the use of a special character prefix (e.g. `#`) to identify the hidden state variables. There has been very significant community feedback in opposition to both the `#` prefix in particular, and the general concept of special character prefixing of identifiers.

It should be noted that "public fields" add no capability that is not already available. JavaScript programmers understand how to define and initialize own properties of class instances. They do it via assignment in the class constructor. "Public field" declarations increase overall complexity but add no new essential capability.

If we choose to have public fields (which have some minor problems of their own), then we will be lead irresistibly toward private fields and private methods (which have a bunch of problems). The upside of public fields is fairly small, while the downside of private fields and methods is fairly large. Therefore, it is better not to have public fields at all, and choose a different non-field syntax for instance variables.
