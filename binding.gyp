{
  "targets": [
    {
      "target_name": "tree_sitter_bend_binding",
      "include_dirs": [
        "<!(node -e \"console.log(require('nan').includes)\")",
        "src"
      ],
      "sources": [
        "bindings/node/binding.cc",
        "src/parser.c",
        "src/tree_sitter/alloc.c",
        "src/tree_sitter/array.c"
      ],
      "conditions": [
        ["OS!='win'", {
          "cflags_c": [
            "-std=c99"
          ]
        }]
      ]
    }
  ]
}