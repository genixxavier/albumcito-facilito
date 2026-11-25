Feature: Highlights de la página de inicio
  Como visitante
  Quiero ver las estampas y álbumes más populares
  Para descubrir qué coleccionar

  Scenario: Dar like a un álbum lo hace aparecer entre los más gustados
    Given estoy en la página "/signup"
    When me registro con nombre "Lía Paz", correo "lia@example.com" y contraseña "secreto123"
    And soy redirigido a "/onboarding"
    And abro la página "/"
    And doy me gusta al álbum "Cody en el espacio"
    Then veo en la sección "Álbumes más gustados" el álbum "Cody en el espacio"

  Scenario: Un visitante sin sesión es llevado a iniciar sesión al dar like
    Given estoy en la página "/"
    When doy me gusta al álbum "Cody programador"
    Then soy redirigido a "/login"
