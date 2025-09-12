; Bend2 Syntax Highlighting - Working Version
; Provides comprehensive syntax highlighting for Bend2 dependent type language

; ============================================================================
; KEYWORDS
; ============================================================================

; Handle 'def' keyword specifically in function and variable definitions
(function_definition "def" @keyword.function)
(variable_definition "def" @keyword.storage)
"type" @keyword.type
"case" @keyword.conditional
"import" @keyword.import
"as" @keyword.import
"if" @keyword.conditional
"else" @keyword.conditional
"elif" @keyword.conditional
"match" @keyword.conditional
"fork" @keyword.conditional
"with" @keyword.storage.modifier
"lambda" @keyword.function
"λ" @keyword.function
"use" @keyword.storage.modifier
"mu" @keyword.function
"μ" @keyword.function
"rewrite" @keyword.operator
"trust" @keyword.operator
"absurd" @keyword.operator
"finally" @keyword.operator
"log" @keyword.function.builtin
"view" @keyword.function.builtin
"return" @keyword.control
"enum" @keyword.type
"ref" @keyword.storage.modifier
"sub" @keyword.operator

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

(function_definition (identifier) @function)
(variable_definition (identifier) @variable.definition)
(type_definition (identifier) @type.definition)
(parameter (identifier) @parameter)
(type_parameter (identifier) @type.parameter)

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
"0n" @number
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
"<" @operator.comparison
">" @operator.comparison
"<=" @operator.comparison
">=" @operator.comparison
"==" @operator.equality
"!=" @operator.equality
"===" @operator.equality
"!==" @operator.equality
"<<" @operator.bitwise
">>" @operator.bitwise
"~" @operator.bitwise
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
(module_path (identifier) @namespace)
(import_declaration "as" @keyword.import (identifier) @namespace)

; ============================================================================
; ADVANCED CONSTRUCTS
; ============================================================================

(field_declaration (identifier) @property (_) @type)
(type_check "::" @operator.type)
(log_expression "log" @function.builtin)
(view_expression "view" @function.builtin)
(return_expression "return" @keyword.control)
(rewrite_expression "rewrite" @keyword.operator)
(absurd_expression "absurd" @keyword.operator)

; ============================================================================
; FALLBACK
; ============================================================================

(identifier) @variable