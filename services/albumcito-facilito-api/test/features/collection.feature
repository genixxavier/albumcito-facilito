Feature: Colección y onboarding
  Como persona recién registrada
  Quiero añadir mi primera estampa a mi colección
  Para empezar mi álbum en la misma sesión

  Scenario: Una cuenta nueva tiene el onboarding pendiente
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When consulto mi perfil con el token de "ana@example.com"
    Then el campo onboarding de mi perfil es "false"

  Scenario: Añadir la primera estampa completa el onboarding
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When añado la estampa "aventuras-1" con el token de "ana@example.com"
    Then recibo el estado 200
    And mi colección contiene la estampa "aventuras-1"
    And el campo onboarding de mi perfil es "true"
    And se registró una vez el evento "onboarding.completed"

  Scenario: Añadir una estampa repetida es idempotente
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    And ya añadí la estampa "aventuras-1" con el token de "ana@example.com"
    When añado la estampa "aventuras-1" con el token de "ana@example.com"
    Then recibo el estado 200
    And mi colección tiene 1 estampa
    And se registró una vez el evento "onboarding.completed"

  Scenario: Añadir una estampa sin token
    Given la API está en ejecución
    When añado la estampa "aventuras-1" sin token
    Then recibo el estado 401

  Scenario: Añadir una estampa inexistente
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When añado la estampa "no-existe" con el token de "ana@example.com"
    Then recibo el estado 404

  Scenario: Cada usuario tiene su propia colección
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    And existe otro usuario con correo "luis@example.com"
    And ya añadí la estampa "aventuras-1" con el token de "ana@example.com"
    When consulto la colección con el token de "luis@example.com"
    Then recibo el estado 200
    And mi colección tiene 0 estampas
