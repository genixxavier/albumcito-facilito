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
