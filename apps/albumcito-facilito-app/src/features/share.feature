Feature: Compartir álbumes y estampas
  Como visitante
  Quiero compartir un álbum o una estampa en redes sociales
  Para que mis amigos lo vean

  Scenario: Cada álbum de la home tiene botón de compartir
    Given la API tiene los álbumes "Las aventuras de Cody" y "Cody en el espacio"
    When abro la página de inicio sin sesión
    Then veo 2 botones "Compartir"

  Scenario: Abrir el modal para compartir un álbum
    Given la API tiene los álbumes "Las aventuras de Cody" y "Cody en el espacio"
    When abro la página de inicio sin sesión
    And pulso compartir en el álbum "Cody en el espacio"
    Then veo el diálogo "Compartir Cody en el espacio"
    And el diálogo ofrece Facebook, X (Twitter), WhatsApp, Telegram, Correo y Copiar enlace
    And la página sigue en la home

  Scenario: Compartir una estampa enlaza a su ancla
    Given la API tiene el álbum "Cody en el espacio" con las estampas "Cody astronauta" y "Cohete de Cody"
    When abro el álbum "cody-espacio"
    And pulso compartir en la estampa "Cody astronauta"
    Then el enlace de Telegram contiene la URL "/albums/cody-espacio#sticker-1"

  Scenario: Copiar el enlace de un álbum
    Given la API tiene los álbumes "Las aventuras de Cody" y "Cody en el espacio"
    When abro la página de inicio sin sesión
    And pulso compartir en el álbum "Cody en el espacio"
    And pulso "Copiar enlace"
    Then veo el mensaje "Enlace copiado"
