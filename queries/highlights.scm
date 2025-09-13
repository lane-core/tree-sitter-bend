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
  name: (identifier) @function.definition)
(type_definition 
  (identifier) @type.definition)
(parameter 
  (identifier) @parameter)
(type_parameter 
  (identifier) @type.parameter)

; ============================================================================
; APPLICATIONS
; ============================================================================

(application_expression (identifier) @function.call)
(implicit_application (identifier) @function.call)
(type_application (identifier) @type)

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

(line_comment) @comment.line
(block_comment) @comment.block

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