; Bend2 Syntax Highlighting

; Keywords
"def" @keyword.function
"type" @keyword.type
"case" @keyword.conditional
"if" @keyword.conditional
"else" @keyword.conditional
"match" @keyword.conditional
"import" @keyword.import
"as" @keyword.import
"lambda" @keyword.function
"λ" @keyword.function

; Types and type annotations
(identifier) @type
  (#match? @type "^[A-Z]")

; Function definitions
(function_definition
  (identifier) @function)

; Function calls
(application_expression
  (identifier) @function.call)

; Type definitions
(type_definition
  (identifier) @type.definition)

; Constructor tags
(constructor_tag
  "@" @constructor
  (identifier) @constructor)

; Parameters
(parameter
  (identifier) @parameter
  (identifier) @type)

; Variables and identifiers
(identifier) @variable

; Literals
(boolean_literal) @boolean
(nat_literal) @number
(integer_literal) @number
(string_literal) @string

; Comments
(line_comment) @comment
(block_comment) @comment

; Operators and punctuation
"->" @operator
":" @operator
"." @operator
"(" @punctuation.bracket
")" @punctuation.bracket
"," @punctuation.delimiter
"/" @punctuation.delimiter
"@" @punctuation.special

; Module paths
(module_path
  (identifier) @namespace)