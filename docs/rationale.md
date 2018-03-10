# Technical Notes and Rationale

## Instance Variables
- Instance variables provide per instance state that is only accessible to code that is defined within the body of a class definition.
- Instance variables are not object properties and have minimal semantic overlap with properties. They do not have attributes. They are
not accessible via prototype lookup. They generally<sup>1</sup> may not be dynamically added after their construction is completed. They
may not be deleted. We think it is very important to JS programmer develop a conceputal model of objects that do not confuse or
conflate instance variables and own properties.
- Instance variables are declared using a distinct class body element (`var` definition) and a distinct access operator (`->`) in
order to conceptually distance them from the concept of object properties.
- Instance variables are not visible to any existing reflection mechanisms and instance variable accesses are not
trapped by ECMAScript Proxies. 
- `var` is repurposed to declare instance variables because its name is suggestive of "instance VARiable".  Note that several
early ES class proposals including the original ES4 proposals used `var` for this purpose.
- Instance variable declarations do not have initializers because initializers would add significant complexity.  Without initializers, we don't
have to define their evaluaiton order or the scoping of the initializer expressions.  JS developers are already used to using constructors
to initialize per instance properties so also initializing instance variables should seem natural to them.
## Hidden Methods
- Instance variable declrations do not have initializers to simplify things.  Without them, we don't have to define their evaluaiton order or the scoping of the initializer expressions.  People are already used to using constructors to initialize instance state.
- Hidden names (instance variables and hidden methods) exit in the same namespace so an instance variable may not have the same name as a hidden method.
- The kind of thing a secret name is bound to is based upon its declration.  -> may statically determines from the supplied name whether it is accessing an instance variable, a secret accessor method, or invoking a secret method.
- Any  concise method form may be used to define a hidden method.  It's the `hidden` prefix to the concise method definition that makes it a hidden method.
- Hidden methods don't have any special semantics for their bodies. The Home object of a hidden method is set exacty the same way it would be set if the `hidden` prefix was absent.
- There is no particular reason why we couldn't have `static` instance variables and `static` secret method definitions.  But it is simplier to not have to explain how they differ from the non-static forms.
- It is an early error to assign to a secret method reference (unless it is an accessor method)
- Because secret methods are statically resolvable and immutable, it is easy for an implementation to statically in-line them.  No flow analysis or dynamic specialization required.
- The `var` declarations of a class collective and statically defined the "shape` of the secret instance state introduced by that class definition. Subclass can add additional secret state "shapes" but overall it is a step closer to objects with a fixed shape determined at class definition time and should also make it easier to lift the internal checks needed on instance var accesses.
