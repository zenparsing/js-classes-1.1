# Why A New Proposal

## Motivation

TC39 has been working on proposals to extend the current class definition syntax and semantics since before ES2015 was completed. These proposals have been created by different authors and on different time scales. While there have been attempts to coordinate and integrate the proposals, the overall result is a large set of distinct features with complex interactions among themselves and the already standardized features of the language. There have been significant concerns raised about the overall complexity both by community members and from TC39 members. One major syntactic choice (the `#` prefix for private members) have proven to be particular concerning to many community members.

Yet TC39 has continued to move forward with these proposals, some of them reaching Stage 3 of the TC39 process. Even with the negative community feedback and the internal concerns the incorporation of the current proposals into the standard seems inevitable. There is great reluctance among members to break consensus and there are no serious alternatives on the table that a new consensus could form around.

The purpose of this proposal is to provide such an alternative that eliminates the complexity and community concern about the current proposals.  We hope that TC39 will use the new proposal as an opportunity to reevaluate both the goals and the current approach to extending ECMAScript class definitions.

## Approach

We decided against simply taking the existing proposals and tweaking them to eliminate problems.  Instead, we started with a clean slate (the ES2015 class definition syntax and semantics), defined  goals and requirements for extending ES2015 class definitions, and tried to create a new unified design that satisfies them. In developing the new design we were informed by the work done for the existing proposals and the feedback received but we were not constrained by the existing proposals' design decisions.

We want a design that feels right for JavaScript.  We don't feel compelled to duplicate the class functionality of Java, Ruby, Smalltalk, or any other language. We don't believe we must (or can) satisfy every feature request or every imaginable use case for classes. We just need to provide a design that usefully enhances the capabilities of JavaScript for now and the foreseeable future.

## Design Rules

We identified a set of design rules that we have followed in developing our proposal. The set of extensions in this proposal should:

- Focus on fundamental capabilities that require engine level support.
- Be as small as possible.
- Support a user conceptual model that is as simple as possible. It should be easy to teach and easy to understand.
- Be internally consistent, with few, if any, special cases or unexpected feature interactions.
- Have a pleasant, usable, and uncontroversial syntax.
- Allow transpiler-based dialects by being syntactically orthogonal to known existing class extensions.
- Be complete.  We don't expect to have to add of any new kinds of class elements in the foreseeable future.
