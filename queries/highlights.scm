; Bend Syntax Highlighting
; Based on canonical Bend2 syntax

; ============================================================================
; KEYWORDS
; ============================================================================

; Function and type definitions
"def" @keyword.function
"type" @keyword.type
"case" @keyword.conditional
"assert" @keyword
"try" @keyword

; Control flow
"if" @keyword.conditional
"else" @keyword.conditional
"elif" @keyword.conditional
"match" @keyword.conditional
"fork" @keyword.conditional
"with" @keyword

; Lambda and fixed point
"lambda" @keyword.function
"λ" @keyword.function
"μ" @keyword.function

; Import system
"import" @keyword.import
"as" @keyword.import

; Special expressions
"use" @keyword
"rewrite" @keyword
"trust" @keyword
"absurd" @keyword
"finally" @keyword
"return" @keyword.return
"log" @keyword.function.builtin
"view" @keyword.function.builtin
"enum" @keyword.type

; Logical operators
"and" @operator.logical
"or" @operator.logical
"||" @operator.logical
"&&" @operator.logical
"xor" @operator.logical
"not" @operator.logical

; ============================================================================
; TYPE SYSTEM
; ============================================================================

; Built-in types
(type_universe) @type.builtin
(empty_type) @type.builtin
(unit_type) @type.builtin
(boolean_type) @type.builtin
(natural_type) @type.builtin
(numeric_type) @type.builtin
(self_type) @type.builtin

; Dependent type quantifiers
"all" @keyword.type
"∀" @keyword.type
"any" @keyword.type
"Σ" @keyword.type

; ============================================================================
; DEFINITIONS
; ============================================================================

(function_definition 
  name: (name (identifier) @function.definition))
(function_definition
  name: (name (hierarchical_name
    function_name: (identifier) @function.definition)))
(type_definition 
  (identifier) @type.definition)
(parameter 
  (identifier) @parameter)
(type_parameter 
  (identifier) @type.parameter)

; Import declarations
(import_declaration
  module_path: (module_path) @module)
(import_declaration
  alias: (identifier) @module)

; ============================================================================
; HIERARCHICAL NAMES
; ============================================================================

; Namespace components - use @constant for strong visual distinction
(hierarchical_name
  namespace_component: (identifier) @constant.builtin)

; Function names in hierarchical names - keep as function
(hierarchical_name
  function_name: (identifier) @function.method)

; Make slashes stand out as operators
(hierarchical_name "/" @operator)

; ============================================================================
; APPLICATIONS
; ============================================================================

(application_expression function: (identifier) @function.call)
(application_expression function: (name (identifier) @function.call))
(application_expression function: (name (hierarchical_name
  namespace_component: (identifier) @constant.builtin
  function_name: (identifier) @function.call)))
(type_application (name (identifier) @type))
(type_application (name (hierarchical_name
  namespace_component: (identifier) @constant.builtin
  function_name: (identifier) @type)))

; ============================================================================
; CONSTRUCTORS
; ============================================================================

(constructor_tag "@" @constructor (identifier) @constructor)
(enum_symbol "&" @constructor (identifier) @constructor)
(constructor_application (constructor_tag (identifier) @constructor))

; ============================================================================
; VARIABLES
; ============================================================================

(lambda_expression (identifier) @parameter)
(pattern (identifier) @parameter)
(let_expression (identifier) @variable.definition)
(use_expression (identifier) @variable.definition)
(with_clause (identifier) @variable)
(fix_expression (identifier) @variable.special)

; ============================================================================
; LITERALS
; ============================================================================

(boolean_literal) @constant.builtin.boolean
"True" @constant.builtin.boolean
"False" @constant.builtin.boolean
(nat_literal) @number
(integer_literal) @number
(float_literal) @number.float
(character_literal) @character
(string_literal) @string
(unit_literal) @constant.builtin
"()" @constant.builtin
(empty_list) @constant.builtin
"[]" @constant.builtin
(era_expression) @constant.builtin
"*" @constant.builtin
(reflexivity_proof) @constant.builtin
"{==}" @constant.builtin
"finally" @constant.builtin

; ============================================================================
; OPERATORS
; ============================================================================

"->" @operator.type
"." @operator.type
"::" @operator.type
":" @operator.type
"=" @operator.assignment
"+" @operator.arithmetic
"-" @operator.arithmetic
"*" @operator.arithmetic
"/" @operator.arithmetic
"%" @operator.arithmetic
"**" @operator.arithmetic
"<<" @operator.bitwise
">>" @operator.bitwise
"<" @operator.comparison
">" @operator.comparison
"<=" @operator.comparison
">=" @operator.comparison
"==" @operator.equality
"!=" @operator.equality
"===" @operator.equality
"!==" @operator.equality
"~" @operator
"<>" @operator.list
"&" @operator.special

; ============================================================================
; PUNCTUATION
; ============================================================================

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"," @punctuation.delimiter
";" @punctuation.delimiter
"/" @punctuation.delimiter
"@" @punctuation.special
"&" @punctuation.special
"?" @punctuation.special

; ============================================================================
; MATCH PATTERNS
; ============================================================================

(match_expression "match" @keyword.conditional)
(match_case "case" @keyword.conditional)
(unit_match "()" @constant.builtin)
(bool_match "False" @constant.builtin.boolean)
(bool_match "True" @constant.builtin.boolean)
(nat_match "0n" @number)
(nat_match "1n+" @number)
(list_match "[]" @constant.builtin)
(list_match "<>" @operator.list)
(pair_match "(,)" @punctuation.bracket)
(equality_match "{==}" @constant.builtin)

; Pattern features
(as_pattern "as" @keyword.operator)
(type_annotated_pattern ":" @operator.type)

; ============================================================================
; SPECIAL FEATURES
; ============================================================================

(superposition "&" @operator.special)
(tilde_expression "~" @operator.special)
(tilde_match "~" @operator.special)
(trust_expression "trust" @keyword.operator)
(fork_expression "fork" @keyword.conditional)

; ============================================================================
; PRIMITIVES
; ============================================================================

(primitive_function) @function.builtin
"U64_TO_CHAR" @function.builtin
"CHAR_TO_U64" @function.builtin
"HVM_INC" @function.builtin
"HVM_DEC" @function.builtin

; ============================================================================
; COMMENTS AND MODULES
; ============================================================================

; Basic comments
(line_comment) @comment.line
(block_comment) @comment.block

; Special comment markers (TODO, FIXME, NOTE, etc.)
((line_comment) @comment.documentation
  (#match? @comment.documentation "^#\\s*(TODO|FIXME|NOTE|WARNING|HACK|XXX|BUG|IMPORTANT):"))

((block_comment) @comment.documentation
  (#match? @comment.documentation "\\{-\\s*(TODO|FIXME|NOTE|WARNING|HACK|XXX|BUG|IMPORTANT):"))

; ============================================================================
; ADVANCED CONSTRUCTS
; ============================================================================

(field_declaration 
  (identifier) @property 
  (_) @type)
(type_check "::" @operator.type)
(log_expression "log" @function.builtin)
(view_expression "view" @function.builtin)
(return_expression "return" @keyword.control)
(rewrite_expression "rewrite" @keyword.operator)
(absurd_expression "absurd" @keyword.operator)
(trust_expression "trust" @keyword)
(use_expression "use" @keyword)
(fix_expression "μ" @keyword.function)

; ============================================================================
; FALLBACK
; ============================================================================

(identifier) @variable