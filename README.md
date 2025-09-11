# tree-sitter-bend

AI-generated tree-sitter grammar and syntax highlighting for the Bend2 language.

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

# How To Install

Adapt for your method of loading tree-sitter defs. Because this grammar isn't currently in tree-sitter packs like nvim-treesitter, for highlighting to work copy/symlink the queries folder to wherever your editor of choice needs to look for it. I use neovim with LazyVim, so my editor looks in `~/.local/share/nvim/lazy/nvim-treesitter/queries/bend/`. This is the code I use to load the grammar, after which I install with `:TSInstall`.

```lua
return {
  {
    "nvim-treesitter/nvim-treesitter",
    config = function(plugin, opts)
      -- Call the original config first
      require("nvim-treesitter").setup(opts)

      -- Add Bend2 filetype
      vim.filetype.add({ extension = { bend = "bend" } })

      -- Then add parser
      local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
      parser_config.bend = {
        install_info = {
          url = "https://github.com/lane-core/tree-sitter-bend",
          files = { "src/parser.c" },
          branch = "master",
          generate_requires_npm = false,
          requires_generate_from_grammar = false,
        },
        filetype = "bend",
      }
    end,
  },
}
```

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

