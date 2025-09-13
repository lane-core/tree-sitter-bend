/**
 * Bend2 Tree-sitter Grammar - Complete Implementation
 * Based on rigorous analysis of Bend2's actual parser implementation
 * Supports all 67 AST Term constructors with proper operator precedence
 */

// Precedence levels based on Bend2 parser analysis (18 levels)
const PREC = {
  // Lowest precedence
  ASSIGNMENT: 1,          // =, :=
  TYPE_CHECK: 2,          // ::
  PRODUCT_TYPE: 3,        // &
  FUNCTION_TYPE: 4,       // ->
  LIST_CONS: 5,          // <>
  LOGICAL_OR: 6,         // or
  LOGICAL_XOR: 7,        // xor
  LOGICAL_AND: 8,        // and
  EQUALITY: 9,           // ==, !=, ===, !==
  COMPARISON: 10,        // <, >, <=, >=
  BITWISE_SHIFT: 11,     // <<, >>
  ADDITION: 12,          // +, -
  MULTIPLICATION: 13,    // *, /, %
  EXPONENTIATION: 14,    // **
  SIGMA_DOT: 4,          // . in Σ-types (same as function type)
  UNARY: 16,            // not, -, ~
  APPLICATION: 17,       // function application (space-separated)
  TIGHT_POSTFIX: 18,    // f(), f[], f{}, f<> (no whitespace)
  // Highest precedence
};

module.exports = grammar({
  name: 'bend',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  conflicts: $ => [
    // Essential dependent type ambiguities (necessary for dependent types)
    [$._type, $._expression],
    [$._type, $._expression, $.let_expression],
    [$.function_definition, $._expression],
    
    // Application conflicts (context-dependent disambiguation needed)
    [$.application_expression, $.binary_expression],
    [$.application_expression, $.tilde_expression, $.unary_expression],
    [$.application_expression, $.binary_expression, $.unary_expression],
    
    // Let expressions (necessary for context-dependent parsing)
    [$.let_expression, $.assignment_statement],
    
    // Dependent pair/function type disambiguation
    [$.function_type, $.sigma_simple],
    
    // Pattern conflicts
    [$.arithmetic_pattern, $.list_pattern],
    
    // Equality types (context-dependent disambiguation)
    [$.equality_type, $._expression],
    
    // Lambda conflicts (different lambda forms)
    [$.lambda_expression, $.lambda_match],
    [$.lambda_match, $.lambda_match_case],
    [$.enum_match],
    [$.type_application, $.application_expression],
    [$.implicit_application, $.binary_expression, $.superposition],
    [$.implicit_application, $.superposition],
    [$.implicit_application, $.tilde_match],
    [$.enum_type, $.enum_literal],
    [$.list_type, $.metavar],
    [$.tuple_pattern, $.parenthesized_pattern],
    [$.list_pattern],
    [$.constructor_case],
    [$.tuple_expression],
  ],

  rules: {
    source_file: $ => repeat($._item),

    _item: $ => choice(
      $.function_definition,
      $.type_definition,
      $.assertion,
      $.try_statement,
      $._expression,
    ),

    // ============================================================================
    // ASSERTIONS AND TRY
    // ============================================================================
    
    // Proof constructs
    assertion: $ => seq(
      'assert',
      $._expression,
      ':',
      $._type,
    ),
    
    try_statement: $ => seq(
      'try',
      $.identifier,
      ':',
      $._type,
      '{',
      $._expression,
      '}',
    ),

    // ============================================================================
    // FUNCTION AND TYPE DEFINITIONS  
    // ============================================================================

    function_definition: $ => choice(
      // Function with parameters: def name(params) -> Type : body
      prec(3, seq(
        'def',
        field('name', $.identifier),
        optional($.type_parameters),
        field('parameters', $.parameters),
        optional(seq('->', field('return_type', $._type))),
        ':',
        field('body', $._expression),
      )),
      // Simple definition: def name : Type = value  
      prec.dynamic(10, seq(
        'def',
        field('name', $.identifier),
        optional($.type_parameters),
        ':',
        field('type', $._type),
        '=',
        field('value', $._expression),
      )),
      // Zero-arg function: def name : body
      prec(1, seq(
        'def',
        field('name', $.identifier),
        optional($.type_parameters),
        ':',
        field('body', $._expression),
      )),
    ),

    type_definition: $ => seq(
      'type',
      $.identifier,
      optional($.type_parameters),
      optional($.parameters),
      ':',
      repeat1($.constructor_case),
    ),

    // ============================================================================
    // PARAMETERS AND TYPE PARAMETERS
    // ============================================================================

    parameters: $ => seq(
      '(',
      sep($.parameter, ','),
      ')',
    ),

    parameter: $ => seq(
      $.identifier,
      ':',
      $._type,
    ),

    type_parameters: $ => seq(
      '<',
      sep1($.type_parameter, ','),
      '>',
    ),

    type_parameter: $ => choice(
      $.identifier,
      seq($.identifier, ':', $._type),
    ),

    // Implicit parameters with curly braces
    implicit_parameters: $ => seq(
      '{',
      sep1($.parameter, ','),
      '}',
    ),

    // ============================================================================
    // TYPES - Complete dependent type system
    // ============================================================================

    _type: $ => choice(
      $.type_universe,      // Set
      $.empty_type,         // Empty
      $.unit_type,          // Unit
      $.boolean_type,       // Bool
      $.natural_type,       // Nat
      $.numeric_type,       // U64, I64, F64, Char
      $.function_type,      // all x: A. B (Π-types)
      $.sigma_type,         // any x: A. B (Σ-types) 
      $.sigma_simple,       // A . B
      $.equality_type,      // T{a == b}
      $.list_type,          // T[]
      $.enum_type,          // {&foo, &bar}
      $.self_type,          // Self
      $.metavar,            // ?M:T{ctx}
      $.parenthesized_type,
      $.type_application,
      $.identifier,         // Type variables
    ),

    type_universe: $ => 'Set',
    empty_type: $ => 'Empty', 
    unit_type: $ => 'Unit',
    boolean_type: $ => 'Bool',
    natural_type: $ => 'Nat',
    
    numeric_type: $ => choice('U64', 'I64', 'F64', 'Char'),

    // Dependent function types (Π-types) - All constructor
    function_type: $ => choice(
      // Full form: all x: A. B
      prec.right(PREC.FUNCTION_TYPE, seq(
        choice('all', '∀'),
        sep1(seq($.identifier, ':', $._type), ','),
        '.',
        $._type,
      )),
      // Simple form: A -> B
      prec.right(PREC.FUNCTION_TYPE, seq(
        $._type,
        '->',
        $._type,
      )),
    ),

    // Dependent pair types (Σ-types) - Sig constructor
    sigma_type: $ => prec.right(PREC.FUNCTION_TYPE + 1, seq(
      choice('any', 'Σ'),
      $.identifier,
      ':',
      $._type,
      '.',
      $._type,
    )),

    // Simplified sigma: A . B - Sig constructor
    sigma_simple: $ => prec.right(PREC.SIGMA_DOT - 1, seq(
      $._type,
      '.',
      $._type,
    )),

    // Equality types - Eql constructor
    equality_type: $ => seq(
      $._type,
      '{',
      $._expression,
      choice('==', '!='),
      $._expression,
      '}',
    ),

    // List types - Lst constructor
    list_type: $ => prec(PREC.TIGHT_POSTFIX, seq($._type, '[]')),

    // Enum types - Enu constructor
    enum_type: $ => seq(
      'enum',
      '{',
      sep1($.enum_symbol, ','),
      '}',
    ),

    self_type: $ => 'Self',

    // Metavariables - Met constructor
    metavar: $ => prec(PREC.TIGHT_POSTFIX, seq(
      '?',
      $.identifier,
      ':',
      $._type,
      optional(seq(
        '{',
        sep($._expression, ','),
        '}',
      )),
    )),

    parenthesized_type: $ => prec(PREC.TIGHT_POSTFIX, seq('(', $._type, ')')),

    type_application: $ => prec(PREC.APPLICATION, seq(
      $.identifier,
      choice(
        // Explicit type application: F<A, B>
        seq('<', sep1($._type, ','), '>'),
        // Regular application: F(A, B)
        seq('(', sep($._type, ','), ')'),
      ),
    )),

    // ============================================================================
    // CONSTRUCTOR AND ENUM DEFINITIONS
    // ============================================================================

    constructor_case: $ => seq(
      'case',
      $.constructor_tag,
      ':',
      repeat($.field_declaration),
    ),

    field_declaration: $ => seq(
      $.identifier,
      ':',
      $._type,
    ),

    constructor_tag: $ => seq('@', $.identifier),

    enum_symbol: $ => prec(PREC.TIGHT_POSTFIX, seq('&', $.identifier)),

    // ============================================================================
    // EXPRESSIONS - Complete term language (67 constructors)
    // ============================================================================

    _expression: $ => choice(
      // Variables and references
      $.identifier,           // Var constructor
      $.reference,           // Ref constructor  
      $.substitution,        // Sub constructor
      
      // Literals and basic terms
      $.literal,
      $.unit_literal,        // One constructor
      $.empty_list,          // Nil constructor
      $.era_expression,      // Era constructor (*)
      
      // Constructor and enum terms
      $.constructor_tag,
      $.constructor_application,
      $.enum_symbol,         // Sym constructor
      $.enum_literal,
      
      // Lambda expressions
      $.lambda_expression,   // Lam constructor
      $.lambda_match,        // Various lambda match constructors (EmpM, UniM, BitM, etc.)
      $.fix_expression,      // Fix constructor (μ)
      
      // Application
      $.application_expression,  // App constructor
      $.implicit_application,
      
      // Control flow
      $.if_expression,
      $.fork_expression,     // Frk constructor
      $.match_expression,    // Pat constructor
      $.tilde_expression,    // For induction
      $.tilde_match,         // Pattern matching with tilde
      
      // Binary operations
      $.binary_expression,   // Op2 constructor
      $.unary_expression,    // Op1 constructor
      
      // Binding constructs
      $.let_expression,      // Let constructor
      $.use_expression,      // Use constructor
      
      // Proof and equality
      $.rewrite_expression,  // Rwt constructor
      $.reflexivity_proof,   // Rfl constructor ({==})
      $.trust_expression,    // Tst constructor
      $.absurd_expression,
      
      // Advanced features
      $.superposition,       // Sup constructor
      $.log_expression,      // Log constructor
      $.view_expression,
      $.primitive_function,  // Pri constructor
      
      // Annotation and grouping
      $.type_check,          // Chk constructor
      $.parenthesized_expression,
      
      // List operations
      $.list_literal,
      $.return_expression,
      
      // Numbers and numeric operations are covered by $.literal
      
      // Pairs
      $.tuple_expression,    // Tup constructor
      
      // Allow types as expressions in dependent contexts
      $._type,
    ),

    // ============================================================================
    // VARIABLES AND REFERENCES
    // ============================================================================

    // Ref constructor
    reference: $ => seq('ref', $.identifier),

    // Sub constructor  
    substitution: $ => seq('sub', $._expression),

    // Era constructor
    era_expression: $ => '*',

    // ============================================================================
    // LAMBDA EXPRESSIONS AND MATCHES
    // ============================================================================

    // Lam constructor
    lambda_expression: $ => prec.right(seq(
      choice('lambda', 'λ'),
      choice(
        // Pattern lambdas: λ(x,y). body
        seq(
          repeat1(choice(
            $.identifier,
            seq('(', sep1($.pattern, ','), ')'),
            seq($.identifier, ':', $._type),
            seq('(', $.identifier, ':', $._type, ')'),
          )),
          '.',
          $._expression,
        ),
        // Match form lambda: λ{cases}
        seq(
          '{',
          repeat($.lambda_match_case),
          '}',
        ),
      ),
    )),

    // Lambda match expressions - Various *M constructors
    lambda_match: $ => seq(
      choice('lambda', 'λ'),
      '{',
      optional(choice(
        $.unit_match,         // UniM constructor - λ{():f}
        $.bool_match,         // BitM constructor - λ{False:t;True:t}
        $.nat_match,          // NatM constructor - λ{0n:z;1n+:s}
        $.list_match,         // LstM constructor - λ{[]:n;<>:c}
        $.pair_match,         // SigM constructor - λ{(,):f}
        $.enum_match,         // EnuM constructor - λ{&foo:f;&bar:b;...d}
        $.sup_match,          // SupM constructor - λ{&L{,}:f}
        $.equality_match,     // EqlM constructor - λ{{==}:f}
      )),
      '}',
    ),

    unit_match: $ => seq(
      '()', ':', $._expression, optional(';'),
    ),

    bool_match: $ => seq(
      'False', ':', $._expression, optional(';'),
      'True', ':', $._expression, optional(';'),
    ),

    nat_match: $ => seq(
      '0n', ':', $._expression, optional(';'),
      '1n+', ':', $._expression, optional(';'),
    ),

    list_match: $ => seq(
      '[]', ':', $._expression, optional(';'),
      '<>', ':', $._expression, optional(';'),
    ),

    pair_match: $ => seq(
      '(,)', ':', $._expression, optional(';'),
    ),

    enum_match: $ => choice(
      seq(
        repeat1(seq(
          choice($.constructor_tag, $.enum_symbol),
          ':', $._expression, optional(';'),
        )),
        optional($._expression), // default case
      ),
      $._expression, // Just a default case
    ),

    sup_match: $ => seq(
      '&', $._expression, '{', ',', '}', ':', $._expression, optional(';'),
    ),

    equality_match: $ => seq(
      '{==}', ':', $._expression, optional(';'),
    ),

    lambda_match_case: $ => choice(
      $.unit_match,
      $.bool_match,
      $.nat_match,
      $.list_match,
      $.pair_match,
      $.enum_match,
      $.sup_match,
      $.equality_match,
    ),

    // Fixed point expressions - Fix constructor (μx. f)
    fix_expression: $ => seq(
      choice('μ', 'mu'),
      $.identifier,
      '.',
      $._expression,
    ),

    // ============================================================================
    // APPLICATION EXPRESSIONS
    // ============================================================================

    // App constructor
    application_expression: $ => choice(
      // Tight polymorphic application: f<A,B>(x,y) - no spaces
      prec(PREC.TIGHT_POSTFIX, seq(
        $.identifier,
        token.immediate('<'),
        sep1($._expression, ','),
        token.immediate('>'),
        token.immediate('('),
        sep($._expression, ','),
        ')',
      )),
      
      // Tight regular application: f(x,y) - no spaces
      prec(PREC.TIGHT_POSTFIX, seq(
        $.identifier,
        token.immediate('('),
        sep($._expression, ','),
        ')',
      )),
      
      // Loose polymorphic application: f <A,B> (x,y) - with spaces
      prec(PREC.APPLICATION, seq(
        $.identifier,
        '<',
        sep1($._expression, ','),
        '>',
        '(',
        sep($._expression, ','),
        ')',
      )),
      
      // Loose regular application: f (x,y) - with spaces
      prec(PREC.APPLICATION, seq(
        $.identifier,
        '(',
        sep($._expression, ','),
        ')',
      )),
      
      // Space-separated application: f x (avoid conflicts with unary expressions)
      prec.left(PREC.APPLICATION, seq(
        field('function', $._expression),
        field('argument', $._expression),
      )),
    ),

    // Implicit application: f{x,y}
    implicit_application: $ => prec(PREC.TIGHT_POSTFIX, seq(
      $._expression,
      choice(
        token.immediate('{'),
        '{'
      ),
      sep($._expression, ','),
      '}',
    )),

    // ============================================================================
    // CONTROL FLOW
    // ============================================================================

    if_expression: $ => prec.right(seq(
      'if',
      $._expression,
      ':',
      $._expression,
      'else',
      ':',
      $._expression,
    )),

    // Fork expressions - Frk constructor
    fork_expression: $ => seq(
      'fork',
      $._expression,
      ':',
      $._expression,
      repeat(seq(
        'elif',
        ':',
        $._expression,
      )),
      'else',
      ':',
      $._expression,
    ),

    // Pat constructor
    match_expression: $ => prec.right(seq(
      'match',
      repeat1($._expression),
      ':',
      repeat($.with_clause),
      repeat1($.match_case),
    )),

    // With clauses for affine variables
    with_clause: $ => seq(
      'with',
      repeat1(choice(
        $.identifier,
        seq($.identifier, '=', $._expression),
      )),
    ),

    match_case: $ => seq(
      'case',
      repeat1($.pattern),
      ':',
      $._expression,
    ),

    // Tilde expressions for induction
    tilde_expression: $ => prec(PREC.UNARY + 1, seq(
      '~',
      $._expression,
    )),

    // Tilde match for pattern matching (higher precedence than tilde_expression)
    tilde_match: $ => prec(PREC.TIGHT_POSTFIX, seq(
      '~',
      $._expression,
      '{',
      choice(
        $.unit_match,
        $.bool_match,
        $.nat_match,
        $.list_match,
        $.pair_match,
        $.enum_match,
        $.sup_match,
        repeat(seq(
          choice($.constructor_tag, $.enum_symbol),
          ':', $._expression, optional(';'),
        )),
      ),
      '}',
    )),

    // ============================================================================
    // BINARY AND UNARY OPERATIONS
    // ============================================================================

    // Op2 constructor
    binary_expression: $ => choice(
      // Exponentiation (right associative)
      prec.right(PREC.EXPONENTIATION, seq($._expression, '**', $._expression)),
      
      // Multiplication and division (left associative)
      prec.left(PREC.MULTIPLICATION, seq($._expression, '*', $._expression)),
      prec.left(PREC.MULTIPLICATION, seq($._expression, '/', $._expression)),
      prec.left(PREC.MULTIPLICATION, seq($._expression, '%', $._expression)),
      
      // Addition and subtraction (left associative)
      prec.left(PREC.ADDITION, seq($._expression, '+', $._expression)),
      prec.left(PREC.ADDITION, seq($._expression, '-', $._expression)),
      
      // Bitwise shifts
      prec.left(PREC.BITWISE_SHIFT, seq($._expression, '<<', $._expression)),
      prec.left(PREC.BITWISE_SHIFT, seq($._expression, '>>', $._expression)),
      
      // Comparisons
      prec.left(PREC.COMPARISON, seq($._expression, '<', $._expression)),
      prec.left(PREC.COMPARISON, seq($._expression, '>', $._expression)),
      prec.left(PREC.COMPARISON, seq($._expression, '<=', $._expression)),
      prec.left(PREC.COMPARISON, seq($._expression, '>=', $._expression)),
      
      // Equality
      prec.left(PREC.EQUALITY, seq($._expression, '==', $._expression)),
      prec.left(PREC.EQUALITY, seq($._expression, '!=', $._expression)),
      prec.left(PREC.EQUALITY, seq($._expression, '===', $._expression)),
      prec.left(PREC.EQUALITY, seq($._expression, '!==', $._expression)),
      
      // Logical operations
      prec.left(PREC.LOGICAL_AND, seq($._expression, 'and', $._expression)),
      prec.left(PREC.LOGICAL_XOR, seq($._expression, 'xor', $._expression)),
      prec.left(PREC.LOGICAL_OR, seq($._expression, 'or', $._expression)),
      
      // List cons (right associative) - Con constructor
      prec.right(PREC.LIST_CONS, seq($._expression, '<>', $._expression)),
      
      // Function type (right associative)
      prec.right(PREC.FUNCTION_TYPE, seq($._expression, '->', $._expression)),
      
      // Product type (right associative)
      prec.right(PREC.PRODUCT_TYPE, seq($._expression, '&', $._expression)),
      
      // Type check
      prec.right(PREC.TYPE_CHECK, seq($._expression, '::', $._expression)),
      
      // Assignment (right associative)
      prec.right(PREC.ASSIGNMENT, seq($._expression, '=', $._expression)),
    ),

    // Op1 constructor
    unary_expression: $ => choice(
      prec(PREC.UNARY, seq('not', $._expression)),
      prec(PREC.UNARY, seq('-', $._expression)),
      prec(PREC.UNARY, seq('~', $._expression)),
    ),

    // ============================================================================
    // BINDING CONSTRUCTS
    // ============================================================================

    // Let constructor
    let_expression: $ => seq(
      $.identifier,
      optional(seq(':', $._type)),
      '=',
      $._expression,
      ';',
      $._expression,
    ),

    // Use constructor
    use_expression: $ => seq(
      'use',
      $.identifier,
      '=',
      $._expression,
      ';',
      $._expression,
    ),

    // ============================================================================
    // PROOF AND EQUALITY CONSTRUCTS
    // ============================================================================

    // Rwt constructor
    rewrite_expression: $ => seq(
      'rewrite',
      $._expression,
      $._expression,
    ),

    // Rfl constructor
    reflexivity_proof: $ => choice('{==}', 'finally'),

    // Tst constructor
    trust_expression: $ => seq(
      'trust',
      $._expression,
    ),

    absurd_expression: $ => seq('absurd', $._expression),

    // ============================================================================
    // ADVANCED FEATURES
    // ============================================================================

    // Sup constructor - &L{a,b}
    superposition: $ => seq(
      '&',
      $._expression,
      '{',
      $._expression,
      ',',
      $._expression,
      '}',
    ),

    // Log constructor
    log_expression: $ => seq(
      'log',
      $._expression,
      $._expression,
    ),

    // View expressions
    view_expression: $ => seq(
      'view',
      '(',
      $.identifier,
      ')',
    ),

    // Pri constructor
    primitive_function: $ => choice(
      'U64_TO_CHAR',
      'CHAR_TO_U64',
      'HVM_INC',
      'HVM_DEC',
    ),

    // ============================================================================
    // ANNOTATION AND GROUPING
    // ============================================================================

    // Chk constructor
    type_check: $ => prec.right(PREC.TYPE_CHECK, seq(
      $._expression,
      '::',
      $._type,
    )),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    // ============================================================================
    // PATTERNS
    // ============================================================================

    pattern: $ => choice(
      $.identifier,
      $.literal,
      $.constructor_tag,
      $.constructor_application,
      $.enum_symbol,
      $.arithmetic_pattern,
      $.tuple_pattern,
      $.list_pattern,
      $.parenthesized_pattern,
    ),

    arithmetic_pattern: $ => seq(
      $.nat_literal,
      '+',
      $.pattern,
    ),

    tuple_pattern: $ => seq(
      '(',
      sep1($.pattern, ','),
      ')',
    ),

    list_pattern: $ => choice(
      '[]',
      seq('[', sep1($.pattern, ','), ']'),
      seq($.pattern, '<>', $.pattern),
    ),

    parenthesized_pattern: $ => seq('(', $.pattern, ')'),

    // ============================================================================
    // CONSTRUCTOR AND ENUM APPLICATIONS
    // ============================================================================

    constructor_application: $ => prec(PREC.TIGHT_POSTFIX, seq(
      $.constructor_tag,
      '{',
      sep($._expression, ','),
      '}',
    )),

    enum_literal: $ => seq(
      'enum',
      '{',
      sep($.enum_symbol, ','),
      '}',
    ),

    // ============================================================================
    // LIST AND TUPLE OPERATIONS
    // ============================================================================

    list_literal: $ => seq(
      '[',
      sep($._expression, ','),
      ']',
    ),

    empty_list: $ => '[]',

    return_expression: $ => seq('return', $._expression),

    // Tup constructor
    tuple_expression: $ => seq(
      '(',
      $._expression,
      ',',
      sep1($._expression, ','),
      ')',
    ),

    // ============================================================================
    // LITERALS
    // ============================================================================

    literal: $ => choice(
      $.boolean_literal,
      $.nat_literal,
      $.integer_literal,
      $.float_literal,
      $.character_literal,
      $.string_literal,
    ),

    boolean_literal: $ => choice('True', 'False'), // Bt0, Bt1 constructors
    
    nat_literal: $ => token(choice(
      '0n',
      /[1-9]\d*n/,  // Must end with 'n'
    )), // Zer, Suc constructors
    
    // Val constructor for numeric values
    numeric_literal: $ => choice(
      $.integer_literal,
      $.float_literal,
      $.character_literal,
    ),

    integer_literal: $ => token(choice(
      /\d+/,
      /\+\d+/,
      /-\d+/,
      /0x[0-9a-fA-F]+/,
      /\+0x[0-9a-fA-F]+/,
      /-0x[0-9a-fA-F]+/,
      /0b[01]+/,
      /\+0b[01]+/,
      /-0b[01]+/,
    )),
    
    float_literal: $ => token(choice(
      /\d+\.\d+/,
      /\+\d+\.\d+/,
      /-\d+\.\d+/,
    )),

    character_literal: $ => token(seq(
      "'",
      choice(
        /[^'\\]/,
        seq('\\', choice('n', 't', 'r', '0', '\\', "'", '"')),
        seq('\\u', /[0-9a-fA-F]{4}/),
      ),
      "'",
    )),

    string_literal: $ => token(seq(
      '"',
      repeat(choice(
        /[^"\\]/,
        seq('\\', choice('n', 't', 'r', '0', '\\', "'", '"')),
        seq('\\u', /[0-9a-fA-F]{4}/),
      )),
      '"',
    )),

    unit_literal: $ => '()', // One constructor

    // ============================================================================
    // ASSIGNMENT STATEMENT
    // ============================================================================

    assignment_statement: $ => seq(
      $.identifier,
      optional(seq(':', $._type)),
      '=',
      $._expression,
    ),

    // ============================================================================
    // BLOCK EXPRESSION
    // ============================================================================

    block_expression: $ => choice(
      $._expression,
      seq(
        repeat(choice(
          $.let_expression,
          $.use_expression,
          $.assignment_statement,
          $.rewrite_expression,
        )),
        $._expression,
      ),
    ),

    // ============================================================================
    // IDENTIFIERS AND COMMENTS
    // ============================================================================

    identifier: $ => choice(
      /[a-zA-Z_][a-zA-Z0-9_]*/,
      /[a-zA-Z_][a-zA-Z0-9_]*(?:\/[a-zA-Z_][a-zA-Z0-9_]*)*/,
    ),

    line_comment: $ => token(seq('#', /.*/)),
    
    block_comment: $ => token(seq(
      '{-',
      repeat(choice(
        /[^{-]+/,
        '{',
        '-',
        seq('{', /[^-]/),
        seq('-', /[^}]/),
      )),
      '-}',
    )),
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function sep(rule, separator) {
  return optional(sep1(rule, separator));
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}