Feature: Endpoint raíz de la API
  Como cliente de la API
  Quiero consultar la ruta raíz
  Para saber que el servicio está disponible

  Scenario: Consultar la ruta raíz
    Given la API está en ejecución
    When hago una petición GET a "/"
    Then recibo el estado 200
    And el cuerpo de la respuesta es "Hello World!"
