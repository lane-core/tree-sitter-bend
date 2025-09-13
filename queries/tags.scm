; Bend2 Symbol Navigation

; Function definitions
((function_definition
  name: (name (identifier) @name)) @definition.function)

; Type definitions  
((type_definition
  (identifier) @name) @definition.type)

; Constructor cases
((constructor_case
  (constructor_tag
    (identifier) @name)) @definition.constructor)

; Function calls for references
((application_expression
  function: (name (identifier) @name)) @reference.call)