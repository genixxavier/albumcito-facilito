Feature: Álbumes de Cody
  Como usuario de la app
  Quiero consultar los álbumes y sus estampas
  Para saber qué estampas de Cody puedo coleccionar

  Scenario: Listar los álbumes
    Given la API está en ejecución
    When hago una petición GET a "/albums"
    Then recibo el estado 200
    And la respuesta contiene 3 álbumes
    And el álbum "Las aventuras de Cody" tiene 4 estampas

  Scenario: Ver las estampas de un álbum
    Given la API está en ejecución
    When hago una petición GET a "/albums/cody-espacio/stickers"
    Then recibo el estado 200
    And el álbum de la respuesta se llama "Cody en el espacio"
    And la respuesta contiene 3 estampas
    And la estampa 1 se llama "Cody astronauta"

  Scenario: Consultar un álbum que no existe
    Given la API está en ejecución
    When hago una petición GET a "/albums/no-existe/stickers"
    Then recibo el estado 404
