Feature: Autenticación
  Como visitante
  Quiero registrarme e iniciar sesión
  Para ver mi dashboard personal

  Scenario: Formulario de registro
    When abro la página de registro
    Then veo los campos "Nombre", "Correo" y "Contraseña"

  Scenario: Formulario de inicio de sesión
    When abro la página de inicio de sesión
    Then veo los campos "Correo" y "Contraseña"
    And no veo el campo "Nombre"

  Scenario: Dashboard del usuario autenticado
    Given una sesión válida del usuario "Ana Pérez" con username "ana-perez"
    When abro el dashboard "ana-perez"
    Then veo el saludo "Hola, Ana Pérez"

  Scenario: Dashboard sin sesión
    Given no hay sesión
    When abro el dashboard "ana-perez"
    Then soy redirigido a "/login"
