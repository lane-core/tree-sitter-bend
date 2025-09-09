/**
 * Bend2 Tree-sitter Grammar - Minimal Working Version
 */

module.exports = grammar({
  name: 'bend',

  extras: $ => [
    /\s/,
    $.line_comment,
    $.block_comment,
  ],

  conflicts: $ => [
    [$._type, $._expression],
    [$._expression, $.let_expression],
    [$.constructor_case],
    [$.array_type, $.field_declaration],
    [$._type, $.type_application],
    [$._expression, $.block_expression],
    [$._expression, $.assignment_statement, $.let_expression],
    [$._expression, $.arithmetic_pattern],
    [$._type, $.let_expression],
    [$.equality_type, $.forall_type],
    [$.forall_type, $.array_type],
  ],

  rules: {
    source_file: $ => repeat($._item),

    _item: $ => choice(
      $.import_declaration,
      $.function_definition,
      $.type_definition,
      $.variable_definition,
      $._expression,  // Allow standalone expressions for testing
    ),

    // Imports
    import_declaration: $ => seq(
      'import',
      $.module_path,
      'as',
      $.identifier,
    ),

    module_path: $ => sep1($.identifier, '/'),

    // Functions
    function_definition: $ => seq(
      'def',
      $.identifier,
      optional($.type_parameters),
      optional($.parameters),
      optional(seq('->', $._type)),
      ':',
      $._expression,
    ),

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

    // Types
    _type: $ => choice(
      $.identifier,
      $.function_type,
      $.equality_type,
      $.array_type,
      $.parenthesized_type,
      $.type_application,
      $.forall_type,
    ),

    function_type: $ => prec.right(11, seq(
      $._type,
      '->',
      $._type,
    )),

    equality_type: $ => seq(
      $._type,
      '{',
      $._expression,
      choice('==', '!='),
      $._expression,
      '}',
    ),

    parenthesized_type: $ => seq('(', $._type, ')'),
    
    type_application: $ => seq(
      $.identifier,
      '(',
      sep($._expression, ','),
      ')',
    ),
    
    forall_type: $ => seq(
      'all',
      repeat1(seq($.identifier, ':', $._type)),
      '.',
      $._type,
    ),

    array_type: $ => seq($._type, '[]'),

    // Types  
    type_definition: $ => seq(
      'type',
      $.identifier,
      optional($.type_parameters),
      optional($.parameters),
      ':',
      repeat1($.constructor_case),
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

    constructor_application: $ => seq(
      $.constructor_tag,
      '{',
      sep($._expression, ','),
      '}',
    ),

    enum_variant: $ => seq('&', $.identifier),

    // Expressions
    _expression: $ => choice(
      $.identifier,
      $.literal,
      $.constructor_tag,
      $.constructor_application,
      $.enum_variant,
      $.lambda_expression,
      $.application_expression,
      $.if_expression,
      $.match_expression,
      $.binary_expression,
      $.parenthesized_expression,
      $.function_type,  // Allow function types in expressions
      $.rewrite_expression,
      $.reflexivity_proof,
      $.absurd_expression,
      $.let_expression,
      $.list_literal,
      $.empty_list,
      $.unit_literal,
      $.return_expression,
      $.enum_literal,
    ),

    lambda_expression: $ => prec.right(seq(
      choice('lambda', 'λ'),
      repeat1($.identifier),
      '.',
      $._expression,
    )),

    application_expression: $ => choice(
      // Polymorphic + regular application: f<A, B>(x, y) (highest precedence)
      prec(3, seq(
        $.identifier,
        token(prec(10, '<')),
        sep($._expression, ','),
        token(prec(10, '>')),
        '(',
        sep($._expression, ','),
        ')',
      )),
      // Regular application: f(x, y) (high precedence)
      prec(2, seq(
        $.identifier,
        '(',
        sep($._expression, ','),
        ')',
      )),
      // Space-separated application: f x (only for simple cases, lower precedence)
      prec(1, seq(
        $.identifier,
        choice(
          $.identifier,
          $.literal,
        ),
      )),
    ),

    if_expression: $ => prec.right(seq(
      'if',
      $._expression,
      ':',
      $._expression,
      'else',
      ':',
      $._expression,
    )),

    match_expression: $ => prec.right(seq(
      'match',
      repeat1($._expression),
      ':',
      repeat1($.match_case),
    )),

    match_case: $ => seq(
      'case',
      repeat1($.pattern),
      ':',
      $.block_expression,
    ),

    pattern: $ => choice(
      $._expression,
      $.arithmetic_pattern,
    ),

    arithmetic_pattern: $ => seq(
      $.literal,
      '+',
      $.identifier,
    ),

    block_expression: $ => choice(
      $._expression,
      seq(
        repeat(choice(
          $.let_expression,
          $.assignment_statement,
          $.rewrite_expression,
        )),
        $._expression,
      ),
    ),

    assignment_statement: $ => seq(
      $.identifier,
      optional(seq(':', $._type)),
      '=',
      $._expression,
    ),

    binary_expression: $ => choice(
      // Arithmetic (higher precedence)
      prec.left(10, seq($._expression, '*', $._expression)),
      prec.left(10, seq($._expression, '/', $._expression)),
      prec.left(9, seq($._expression, '+', $._expression)),
      prec.left(9, seq($._expression, '-', $._expression)),
      
      // List cons (medium precedence) 
      prec.right(8, seq($._expression, token(prec(10, '<>')), $._expression)),
      
      // Comparison (lower precedence)
      prec.left(3, seq($._expression, '==', $._expression)),
      prec.left(3, seq($._expression, '!=', $._expression)),
      prec.left(4, seq($._expression, '<', $._expression)),
      prec.left(4, seq($._expression, '>', $._expression)),
    ),

    rewrite_expression: $ => seq(
      'rewrite',
      $._expression,
      $._expression,
    ),

    absurd_expression: $ => seq('absurd', $._expression),

    let_expression: $ => seq(
      $.identifier,
      optional(seq(':', $._type)),
      '=',
      $._expression,
      ';',
      $._expression,
    ),

    reflexivity_proof: $ => choice('{==}', 'finally'),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    // Literals
    literal: $ => choice(
      $.boolean_literal,
      $.nat_literal,
      $.integer_literal,
      $.string_literal,
    ),

    boolean_literal: $ => choice('True', 'False'),
    nat_literal: $ => seq(/\d+/, 'n'),
    integer_literal: $ => /\d+/,
    string_literal: $ => seq('"', repeat(/[^"]/), '"'),

    // List expressions
    list_literal: $ => seq(
      '[',
      sep($._expression, ','),
      ']',
    ),

    empty_list: $ => '[]',

    unit_literal: $ => '()',

    return_expression: $ => seq('return', $._expression),

    enum_literal: $ => seq(
      'enum',
      '{',
      sep($.enum_variant, ','),
      '}',
    ),

    variable_definition: $ => seq(
      'def',
      $.identifier,
      ':',
      $._type,
      '=',
      $._expression,
    ),

    // Operators
    cons_operator: $ => token(prec(5, '<>')),

    // Identifiers
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_\/]*/,

    // Comments
    line_comment: $ => token(seq('#', /.*/)),
    block_comment: $ => token(seq('{-', repeat(/./), '-}')),
  }
});

// Helper functions
function sep(rule, separator) {
  return optional(sep1(rule, separator));
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}