Feature: Álbumes en la página de inicio
  Como usuario
  Quiero ver los álbumes de Cody en la página de inicio
  Para elegir uno y ver sus estampas

  Scenario: Ver el listado de álbumes
    Given la API tiene los álbumes "Las aventuras de Cody" y "Cody en el espacio"
    When abro la página de inicio
    Then veo el encabezado "Albumcito Facilito"
    And veo 2 álbumes
    And el álbum "Cody en el espacio" enlaza a "/albums/cody-espacio"

  Scenario: Ver las estampas de un álbum
    Given la API tiene el álbum "Cody en el espacio" con las estampas "Cody astronauta" y "Cohete de Cody"
    When abro el álbum "cody-espacio"
    Then veo el encabezado "Cody en el espacio"
    And veo 2 estampas
    And veo la estampa "Cody astronauta"

  Scenario: Abrir un álbum que no existe
    Given la API no tiene el álbum "no-existe"
    When abro el álbum "no-existe"
    Then se muestra la página de no encontrado

  Scenario: Un visitante anónimo ve los rankings
    Given la API tiene las estampas top "Cody astronauta" y "Cohete de Cody"
    And la API tiene los álbumes más gustados "Cody en el espacio" y "Cody programador"
    When abro la página de inicio
    Then veo la sección "Estampas top" con 2 elementos
    And veo la sección "Álbumes más gustados" con 2 elementos
    And la primera estampa top es "Cody astronauta"
    And el primer álbum más gustado es "Cody en el espacio"

  Scenario: Los rankings vacíos no se muestran
    Given la API no tiene rankings
    When abro la página de inicio
    Then no veo la sección "Estampas top"
    And no veo la sección "Álbumes más gustados"
    And veo 2 álbumes

  Scenario: Falla el ranking pero el listado sigue visible
    Given la API falla al cargar los rankings
    When abro la página de inicio
    Then no veo la sección "Álbumes más gustados"
    And veo 2 álbumes

  Scenario: Un usuario autenticado da like desde la home
    Given soy un usuario autenticado que no ha dado like a "Cody en el espacio"
    When abro la página de inicio
    And activo el me gusta de "Cody en el espacio"
    Then el me gusta de "Cody en el espacio" está activo
    And se pidió dar like al álbum "cody-espacio"

  Scenario: Un usuario autenticado ve activo el like de un álbum que ya le gusta
    Given soy un usuario autenticado al que le gusta "Cody en el espacio"
    When abro la página de inicio
    Then el me gusta de "Cody en el espacio" está activo

  Scenario: Un visitante anónimo intenta dar like
    Given soy un visitante sin sesión
    When intento dar like al álbum "cody-espacio"
    Then soy redirigido a "/login"
    And no se registra ningún like
