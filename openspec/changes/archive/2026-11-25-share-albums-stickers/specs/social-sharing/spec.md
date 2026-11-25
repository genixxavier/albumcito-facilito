# Spec Delta

## Purpose

Permite a cualquier visitante compartir un álbum o una estampa fuera de la app (redes sociales, mensajería, portapapeles) desde un modal de opciones.

## ADDED Requirements

### Requirement: Botón de compartir en álbumes y estampas
El sistema SHALL mostrar un botón "Compartir" en cada tarjeta de álbum de la home, en el encabezado del detalle de álbum y en cada estampa del detalle. El botón MUST estar disponible con o sin sesión.

#### Scenario: Botón en la home
- **WHEN** un visitante sin sesión abre `/`
- **THEN** cada tarjeta de álbum muestra un botón "Compartir" accesible por su nombre

#### Scenario: Botón en el detalle
- **WHEN** un visitante abre `/albums/cody-espacio`
- **THEN** ve un botón "Compartir" para el álbum y uno por cada estampa

### Requirement: Modal con opciones de compartir
Al pulsar "Compartir" el sistema SHALL abrir un modal titulado con el nombre del elemento, con las opciones Facebook, X (Twitter), WhatsApp, Telegram, Correo y Copiar enlace. El modal MUST cerrarse con un botón "Cerrar", con la tecla Escape y al pulsar fuera de él, devolviendo el foco al botón que lo abrió.

#### Scenario: Abrir modal
- **WHEN** el visitante pulsa "Compartir" en el álbum "Cody en el espacio"
- **THEN** se muestra un diálogo modal con ese título y las seis opciones

#### Scenario: Cerrar con Escape
- **WHEN** el modal está abierto y el visitante pulsa Escape
- **THEN** el modal se cierra y el foco vuelve al botón "Compartir"

### Requirement: Enlaces de cada red
Cada opción de red SHALL abrir en una pestaña nueva (`noopener noreferrer`) la URL de compartir de esa red, con la URL pública del elemento y un texto descriptivo correctamente codificados.

#### Scenario: WhatsApp
- **WHEN** el visitante elige WhatsApp para el álbum `cody-espacio`
- **THEN** se abre `https://wa.me/?text=…` con el texto y la URL absoluta `/albums/cody-espacio` codificados

#### Scenario: Texto con caracteres especiales
- **WHEN** el título contiene `&`, `#` o acentos
- **THEN** la URL de la red los lleva codificados y el destino recibe el título íntegro

### Requirement: URL compartida
La URL compartida de un álbum SHALL ser su URL absoluta `/albums/<id>` en el origen actual. La de una estampa MUST ser la del álbum con ancla `#sticker-<id>`, y la página SHALL llevar al visitante a esa estampa.

#### Scenario: Compartir una estampa
- **WHEN** el visitante comparte la estampa `s-12` del álbum `cody-espacio`
- **THEN** la URL compartida termina en `/albums/cody-espacio#sticker-s-12`

### Requirement: Copiar enlace
La opción "Copiar enlace" SHALL copiar la URL compartida al portapapeles y confirmar con el mensaje "Enlace copiado". Si el portapapeles no está disponible, el sistema MUST mostrar la URL seleccionable en un campo de texto.

#### Scenario: Copia correcta
- **WHEN** el visitante pulsa "Copiar enlace"
- **THEN** el portapapeles contiene la URL y el modal muestra "Enlace copiado"

#### Scenario: Portapapeles no disponible
- **WHEN** la escritura al portapapeles falla o no existe
- **THEN** el modal muestra la URL en un campo de texto de solo lectura y no muestra "Enlace copiado"

### Requirement: Compartir nativo
Cuando el navegador soporte Web Share API, el modal SHALL ofrecer además "Compartir con…" que invoque el diálogo nativo del sistema. Cancelar el diálogo nativo MUST NOT mostrar error.

#### Scenario: Soporte disponible
- **WHEN** el navegador expone Web Share API y se abre el modal
- **THEN** aparece la opción "Compartir con…"

#### Scenario: Sin soporte
- **WHEN** el navegador no expone Web Share API
- **THEN** la opción "Compartir con…" no aparece

### Requirement: Compartir no interfiere con la navegación ni los likes
Pulsar "Compartir" SHALL NOT navegar a la página del álbum ni alterar el estado del like.

#### Scenario: Botón dentro de la tarjeta
- **WHEN** el visitante pulsa "Compartir" en una tarjeta de la home
- **THEN** se abre el modal y la ruta actual sigue siendo `/`
