Feature: Registro e inicio de sesión
  Como visitante
  Quiero registrarme e iniciar sesión en el navegador
  Para llegar a mi dashboard personal

  Scenario: Registro exitoso lleva al onboarding
    Given estoy en la página "/signup"
    When me registro con nombre "Ana Pérez", correo "ana@example.com" y contraseña "secreto123"
    Then soy redirigido a "/onboarding"
    And veo el encabezado "Elige tu primera estampa"

  Scenario: Dos usuarios con el mismo nombre reciben usernames distintos
    Given existe un usuario "Carla Ruiz" con correo "carla@example.com"
    And estoy en la página "/signup"
    When me registro con nombre "Carla Ruiz", correo "carla2@example.com" y contraseña "secreto123"
    Then soy redirigido a "/onboarding"

  Scenario: Registro con correo duplicado muestra un error
    Given existe un usuario "Beto Díaz" con correo "beto@example.com"
    And estoy en la página "/signup"
    When me registro con nombre "Otro Beto", correo "beto@example.com" y contraseña "secreto123"
    Then veo el error "El correo ya está registrado"
    And sigo en "/signup"

  Scenario: Registro con contraseña corta no avanza
    Given estoy en la página "/signup"
    When me registro con nombre "Fede Paz", correo "fede@example.com" y contraseña "corta"
    Then sigo en "/signup"

  Scenario: Inicio de sesión exitoso redirige al dashboard
    Given existe un usuario "Diana Soto" con correo "diana@example.com"
    And estoy en la página "/login"
    When inicio sesión con correo "diana@example.com" y contraseña "secreto123"
    Then soy redirigido a "/diana-soto"
    And veo el saludo "Hola, Diana Soto"
    And la cookie de sesión es HttpOnly y no es visible desde JavaScript

  Scenario: Inicio de sesión con contraseña incorrecta
    Given existe un usuario "Hugo Mora" con correo "hugo@example.com"
    And estoy en la página "/login"
    When inicio sesión con correo "hugo@example.com" y contraseña "incorrecta1"
    Then veo el error "Credenciales inválidas"
    And sigo en "/login"
    And el campo "Correo" conserva "hugo@example.com"

  Scenario: Dashboard sin sesión redirige al login
    When abro la página "/ana-perez"
    Then soy redirigido a "/login"

  Scenario: Dashboard de otro usuario redirige al propio
    Given existe un usuario "Elena Vega" con correo "elena@example.com"
    And inicié sesión con correo "elena@example.com" y contraseña "secreto123"
    When abro la página "/diana-soto"
    Then soy redirigido a "/elena-vega"

  Scenario: Cerrar sesión
    Given existe un usuario "Iván Lara" con correo "ivan@example.com"
    And inicié sesión con correo "ivan@example.com" y contraseña "secreto123"
    When cierro sesión
    Then soy redirigido a "/login"
    And no hay cookie de sesión
    When abro la página "/ivan-lara"
    Then soy redirigido a "/login"
