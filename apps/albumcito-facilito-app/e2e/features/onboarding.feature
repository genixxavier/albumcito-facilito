Feature: Onboarding de la primera estampa
  Como persona recién registrada
  Quiero añadir mi primera estampa en la misma sesión
  Para empezar mi colección

  Scenario: Añadir la primera estampa y verla en el dashboard
    Given estoy en la página "/signup"
    When me registro con nombre "Olga Rey", correo "olga@example.com" y contraseña "secreto123"
    And añado la estampa "Cody despierta"
    Then veo la confirmación "¡Añadiste «Cody despierta» a tu colección!"
    When voy a mi colección
    Then soy redirigido a "/olga-rey"
    And veo la estampa "Cody despierta" en mi colección

  Scenario: Omitir el onboarding
    Given estoy en la página "/signup"
    When me registro con nombre "Raúl Gil", correo "raul@example.com" y contraseña "secreto123"
    And omito el onboarding
    Then soy redirigido a "/raul-gil"
    And veo "Aún no tienes estampas."

  Scenario: Volver al onboarding tras completarlo redirige al dashboard
    Given estoy en la página "/signup"
    When me registro con nombre "Sara Mil", correo "sara@example.com" y contraseña "secreto123"
    And añado la estampa "Cody despierta"
    And abro la página "/onboarding"
    Then soy redirigido a "/sara-mil"

  Scenario: El inicio de sesión no pasa por el onboarding
    Given existe un usuario "Tomás Ibáñez" con correo "tomas@example.com"
    And estoy en la página "/login"
    When inicio sesión con correo "tomas@example.com" y contraseña "secreto123"
    Then soy redirigido a "/tomas-ibanez"
