Feature: Autenticación
  Como visitante
  Quiero registrarme e iniciar sesión con correo y contraseña
  Para acceder a mi dashboard personal

  Scenario: Registro exitoso
    Given la API está en ejecución
    When me registro con nombre "Ana Pérez", correo "ana@example.com" y contraseña "secreto123"
    Then recibo el estado 201
    And la respuesta incluye un token y el usuario "ana-perez"
    And la respuesta no expone la contraseña

  Scenario: Registro con correo duplicado
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When me registro con nombre "Otra Ana", correo "ana@example.com" y contraseña "secreto123"
    Then recibo el estado 409

  Scenario: Registro con contraseña corta
    Given la API está en ejecución
    When me registro con nombre "Ana Pérez", correo "ana@example.com" y contraseña "corta"
    Then recibo el estado 400

  Scenario: Dos usuarios con el mismo nombre
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When me registro con nombre "Ana Pérez", correo "ana2@example.com" y contraseña "secreto123"
    Then recibo el estado 201
    And la respuesta incluye un token y el usuario "ana-perez-2"

  Scenario: Inicio de sesión exitoso
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When inicio sesión con correo "ana@example.com" y contraseña "secreto123"
    Then recibo el estado 200
    And la respuesta incluye un token y el usuario "ana-perez"

  Scenario: Inicio de sesión con contraseña incorrecta
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When inicio sesión con correo "ana@example.com" y contraseña "incorrecta1"
    Then recibo el estado 401

  Scenario: Consultar el perfil con token
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When consulto mi perfil con el token de "ana@example.com"
    Then recibo el estado 200
    And el perfil de la respuesta es el usuario "ana-perez"

  Scenario: Consultar el perfil sin token
    Given la API está en ejecución
    When hago una petición GET a "/auth/me"
    Then recibo el estado 401
