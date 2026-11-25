Feature: Likes de álbumes y rankings
  Como visitante o usuario
  Quiero dar like a álbumes y ver los más populares
  Para descubrir qué coleccionar

  Scenario: Primer like a un álbum
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When "ana@example.com" da like al álbum "cody-espacio"
    Then recibo el estado 200
    And la respuesta indica liked "true" con 1 likes

  Scenario: Like repetido no suma
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    And "ana@example.com" ya dio like al álbum "cody-espacio"
    When "ana@example.com" da like al álbum "cody-espacio"
    Then recibo el estado 200
    And la respuesta indica liked "true" con 1 likes

  Scenario: Quitar un like
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    And "ana@example.com" ya dio like al álbum "cody-espacio"
    When "ana@example.com" quita el like al álbum "cody-espacio"
    Then recibo el estado 200
    And la respuesta indica liked "false" con 0 likes

  Scenario: Quitar un like inexistente
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When "ana@example.com" quita el like al álbum "cody-espacio"
    Then recibo el estado 200
    And la respuesta indica liked "false" con 0 likes

  Scenario: Like a un álbum inexistente
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    When "ana@example.com" da like al álbum "no-existe"
    Then recibo el estado 404

  Scenario: Like sin sesión
    Given la API está en ejecución
    When un visitante da like al álbum "cody-espacio"
    Then recibo el estado 401

  Scenario: Mis likes
    Given la API está en ejecución
    And existe un usuario registrado con correo "ana@example.com"
    And "ana@example.com" ya dio like al álbum "cody-espacio"
    When "ana@example.com" consulta sus likes
    Then recibo el estado 200
    And mis likes son "cody-espacio"

  Scenario: Álbumes sin likes tienen likeCount cero
    Given la API está en ejecución
    When hago una petición pública GET a "/albums"
    Then recibo el estado 200
    And todos los álbumes tienen likeCount 0

  Scenario: Ranking de álbumes más gustados
    Given la API está en ejecución
    And existen los usuarios "ana@example.com" y "luis@example.com"
    And se dan los likes "ana@example.com:cody-espacio,luis@example.com:cody-espacio,ana@example.com:cody-programador"
    When hago una petición pública GET a "/albums/top"
    Then recibo el estado 200
    And el ranking es "cody-espacio,cody-programador"

  Scenario: Ranking de álbumes vacío
    Given la API está en ejecución
    When hago una petición pública GET a "/albums/top"
    Then recibo el estado 200
    And el ranking es ""

  Scenario: Límite inválido en el ranking de álbumes
    Given la API está en ejecución
    When hago una petición pública GET a "/albums/top?limit=0"
    Then recibo el estado 400

  Scenario: Ranking de estampas top
    Given la API está en ejecución
    And existen los usuarios "ana@example.com" y "luis@example.com"
    And se añaden las estampas "ana@example.com:espacio-2,luis@example.com:espacio-2,ana@example.com:aventuras-1"
    When hago una petición pública GET a "/stickers/top"
    Then recibo el estado 200
    And el ranking es "espacio-2,aventuras-1"

  Scenario: Ranking de estampas vacío
    Given la API está en ejecución
    When hago una petición pública GET a "/stickers/top"
    Then recibo el estado 200
    And el ranking es ""

  Scenario: Límite inválido en el ranking de estampas
    Given la API está en ejecución
    When hago una petición pública GET a "/stickers/top?limit=21"
    Then recibo el estado 400
