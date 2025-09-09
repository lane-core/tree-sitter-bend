; Bend2 Local Variables and Scoping

; Function definitions create scopes
(function_definition) @local.scope

; Lambda expressions create scopes
(lambda_expression) @local.scope

; Match expressions create scopes
(match_expression) @local.scope

; Function parameters
(function_definition
  (parameters
    (parameter
      (identifier) @local.definition.parameter)))

; Lambda parameters
(lambda_expression
  (identifier) @local.definition.parameter)

; Pattern bindings in match cases
(match_case
  (pattern
    (identifier) @local.definition.variable))

; Variable references
(identifier) @local.reference