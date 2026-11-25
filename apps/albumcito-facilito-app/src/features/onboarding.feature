Feature: Onboarding de la primera estampa
  Como persona recién registrada
  Quiero elegir mi primera estampa
  Para empezar mi colección en la misma sesión

  Scenario: Cuenta nueva ve el onboarding
    Given una sesión válida con el onboarding pendiente
    And la API tiene el álbum "Cody en el espacio" con las estampas "Cody astronauta" y "Cohete de Cody"
    When abro el onboarding
    Then veo el encabezado "Elige tu primera estampa"
    And veo 2 estampas para añadir
    And veo el enlace "Omitir por ahora"

  Scenario: Cuenta que ya completó el onboarding va al dashboard
    Given una sesión válida con el onboarding completado
    When abro el onboarding
    Then soy redirigido a "/ana-perez"

  Scenario: Onboarding sin sesión
    Given no hay sesión
    When abro el onboarding
    Then soy redirigido a "/login"
