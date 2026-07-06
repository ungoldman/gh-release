# Contributing Guidelines

## Code of Conduct

This project is intended to be a safe, welcoming space for collaboration.

All contributors are expected to adhere to the [Contributor Covenant](https://contributor-covenant.org) code of conduct.

Thank you for being kind to each other!

## Contributions welcome!

**Before spending lots of time on something, ask for feedback on your idea first!**

Please search [issues](../../issues/) and [pull requests](../../pulls/) before adding something new! This helps avoid duplicating efforts and conversations.

This project welcomes any kind of contribution! Here are a few suggestions:

- **Ideas**: participate in an issue thread or start your own to have your voice heard.
- **Writing**: contribute your expertise in an area by helping expand the included content.
- **Copy editing**: fix typos, clarify language, and generally improve the quality of the content.
- **Formatting**: help keep content easy to read with consistent formatting.
- **Code**: help maintain and improve the project codebase.

## Coding Guidelines

- Commits should be atomic and adhere to [conventional commit](https://conventionalcommits.org) standards.
- Commit messages should be short (`<topic>: <action>`, 50 char max), and commit bodies only included when necessary for complex changes (72 char max).
- Breaking changes are discouraged, and require a `BREAKING CHANGE:` footer in the commit body explaining the change.
- Types and interfaces should be inlined unless they're absolutely necessary for exporting or testing.
- Avoid unnecessary code comments, and keep necessary ones trim.
- All changes should maintain the test coverage gate (100%; the spawn-only `src/bin.ts` is excluded).
