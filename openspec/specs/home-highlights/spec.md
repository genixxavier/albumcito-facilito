# home-highlights Specification

## Purpose

Muestra en la home rankings públicos de estampas y álbumes populares para incentivar la exploración y el registro, sin requerir sesión para verlos.

## Requirements

### Requirement: Ranking público de estampas top
El sistema SHALL exponer `GET /stickers/top` sin autenticación, con las estampas ordenadas por número de usuarios que las poseen (descendente), con desempate por `id` ascendente. Cada elemento MUST incluir la estampa, su `albumId` y `collectorCount`. La respuesta SHALL limitarse a 5 elementos por defecto, o al valor del parámetro `limit` (1–20).

#### Scenario: Ranking con datos
- **WHEN** la estampa `espacio-2` está en 3 colecciones, `aventuras-1` en 2 y el resto en ninguna, y se consulta `GET /stickers/top`
- **THEN** la respuesta lista `espacio-2` (collectorCount 3) antes que `aventuras-1` (collectorCount 2)

#### Scenario: Estampas sin coleccionistas excluidas
- **WHEN** solo una estampa está en alguna colección
- **THEN** la respuesta contiene únicamente esa estampa

#### Scenario: Sin datos
- **WHEN** ningún usuario tiene estampas
- **THEN** la respuesta es 200 con una lista vacía

#### Scenario: Límite inválido
- **WHEN** se consulta `GET /stickers/top?limit=0`
- **THEN** la respuesta es 400

### Requirement: Ranking público de álbumes más gustados
El sistema SHALL exponer `GET /albums/top` sin autenticación, con los álbumes que tienen al menos un like ordenados por `likeCount` descendente, con desempate por `id` ascendente. Cada elemento MUST ser un resumen de álbum con `likeCount`. El límite sigue las mismas reglas que el ranking de estampas.

#### Scenario: Ranking con likes
- **WHEN** `cody-espacio` tiene 2 likes y `cody-programador` tiene 1
- **THEN** `GET /albums/top` devuelve `cody-espacio` primero y `cody-programador` después, y no incluye álbumes con 0 likes

#### Scenario: Sin likes
- **WHEN** ningún álbum tiene likes
- **THEN** la respuesta es 200 con una lista vacía

### Requirement: Secciones de highlights en la home
La home SHALL mostrar las secciones "Estampas top" y "Álbumes más gustados" con los datos de los rankings, visibles para visitantes anónimos y autenticados. Una sección sin elementos MUST ocultarse o mostrar un estado vacío, sin impedir que se muestre el listado de álbumes.

#### Scenario: Visitante anónimo ve los rankings
- **WHEN** un visitante sin sesión abre la home y existen datos en ambos rankings
- **THEN** ve las dos secciones con sus elementos en orden de ranking, cada álbum enlazado a `/albums/<id>`

#### Scenario: Rankings vacíos
- **WHEN** ambos rankings están vacíos
- **THEN** la home muestra el listado de álbumes y ninguna sección de highlights con datos

#### Scenario: Fallo del ranking
- **WHEN** la API de rankings responde con error
- **THEN** la home sigue mostrando el listado de álbumes

### Requirement: Like desde la home
La home SHALL mostrar el conteo de likes de cada álbum destacado y un control para dar o quitar like. Un usuario autenticado MUST ver el control en estado activo para los álbumes que ya le gustan; un visitante anónimo que lo use SHALL ser dirigido a iniciar sesión.

#### Scenario: Usuario autenticado da like
- **WHEN** un usuario autenticado activa el control de like de un álbum en la home
- **THEN** el control pasa a estado activo y el conteo aumenta en 1

#### Scenario: Visitante anónimo intenta dar like
- **WHEN** un visitante sin sesión activa el control de like
- **THEN** es redirigido a `/login` y no se registra ningún like
