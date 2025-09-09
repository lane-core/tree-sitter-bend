# Tree-sitter-bend

Tree-sitter grammar and syntax highlighting for the Bend2 language.

## Features

- Complete Tree-sitter grammar for Bend2 syntax
- Semantic highlighting with support for:
  - Dependent types and type parameters
  - Pattern matching and constructors
  - Proof constructs (rewrite, absurd, etc.)
  - Equality types and expressions
  - Function definitions and calls
  - Unicode symbols (∀, Σ)

## Syntax Highlighting

The grammar provides semantic highlighting for:

- **Function definitions**: `def myFunc`
- **Function calls**: `myFunc()`, `Id/J`, `Id/K`
- **Type definitions**: `type MyType`
- **Type parameters**: `<A: Set>` (binding sites)
- **Constructor tags**: `@Some`, `@None`
- **Constructor fields**: `value: T` in type definitions
- **Dependent types**: `∀x: A. B`, `Σx: A. B`
- **Equality types**: `A{x == y}`
- **Proof constructs**: `rewrite`, `absurd`, `return`
- **Operators**: Context-aware `<>` highlighting
  - `<` and `>` as comparison operators in expressions
  - `<` and `>` as type punctuation in type parameters
- **Literals**: Numbers, strings, booleans

## Repository Structure

```
tree-sitter-bend/
├── README.md              # This file
├── grammar.js             # Core Tree-sitter grammar
├── package.json           # NPM package configuration
├── tree-sitter.json       # Tree-sitter metadata
├── binding.gyp            # Build configuration
├── queries/               # Syntax highlighting queries
│   ├── highlights.scm     # Main highlighting rules
│   ├── locals.scm         # Local scope definitions
│   ├── tags.scm           # Symbol navigation
│   └── injections.scm     # Language injections
├── src/                   # Generated parser (C code)
└── bindings/              # Language bindings
```

## Development

### Prerequisites

- Node.js and npm
- Tree-sitter CLI: `npm install -g tree-sitter-cli`
- C compiler (for building parser)

### Building

```bash
# Generate parser from grammar
npm run generate

# Test parsing
npm run parse examples/test.bend

# Run tests
npm run test
```

### Contributing

1. Modify `grammar.js` for syntax changes
2. Update `queries/highlights.scm` for highlighting changes
3. Test with `./deploy.sh` for local development
4. Run `./install_nvim.sh` to verify complete installation

## License

MIT License. See LICENSE file for details.

## Links

- [Bend2 Language](https://github.com/lane/Bend2)
- [Tree-sitter](https://tree-sitter.github.io/)
- [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)

