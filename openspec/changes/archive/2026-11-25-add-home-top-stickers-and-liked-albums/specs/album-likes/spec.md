# Spec Delta

## Purpose

Permite a los usuarios autenticados expresar que les gusta un álbum y expone cuántos likes tiene cada álbum, como señal de popularidad para el resto de visitantes.

## ADDED Requirements

### Requirement: Dar like a un álbum
El sistema SHALL permitir a un usuario autenticado dar like a un álbum existente. La operación MUST ser idempotente: un usuario cuenta como máximo una vez por álbum.

#### Scenario: Primer like
- **WHEN** un usuario autenticado que no ha dado like al álbum `cody-espacio` hace `PUT /albums/cody-espacio/like`
- **THEN** la respuesta es 200 con `{ albumId: "cody-espacio", liked: true, likeCount }` y `likeCount` aumenta en 1

#### Scenario: Like repetido
- **WHEN** el mismo usuario repite `PUT /albums/cody-espacio/like`
- **THEN** la respuesta es 200 con `liked: true` y `likeCount` no cambia

#### Scenario: Álbum inexistente
- **WHEN** un usuario autenticado hace `PUT /albums/no-existe/like`
- **THEN** la respuesta es 404 y no se registra ningún like

### Requirement: Quitar like de un álbum
El sistema SHALL permitir a un usuario autenticado retirar su like de un álbum. La operación MUST ser idempotente.

#### Scenario: Quitar like existente
- **WHEN** un usuario con like en `cody-espacio` hace `DELETE /albums/cody-espacio/like`
- **THEN** la respuesta es 200 con `liked: false` y `likeCount` disminuye en 1

#### Scenario: Quitar like inexistente
- **WHEN** un usuario sin like en `cody-espacio` hace `DELETE /albums/cody-espacio/like`
- **THEN** la respuesta es 200 con `liked: false` y `likeCount` no cambia

### Requirement: Autenticación para dar y quitar likes
El sistema MUST rechazar con 401 las peticiones de like o unlike sin un JWT Bearer válido.

#### Scenario: Like sin sesión
- **WHEN** se hace `PUT /albums/cody-espacio/like` sin cabecera Authorization
- **THEN** la respuesta es 401 y `likeCount` no cambia

### Requirement: Conteo de likes en el resumen de álbum
El sistema SHALL incluir `likeCount` (entero ≥ 0) en cada resumen de álbum devuelto por `GET /albums`.

#### Scenario: Álbum sin likes
- **WHEN** nadie ha dado like a un álbum y se consulta `GET /albums`
- **THEN** ese álbum aparece con `likeCount: 0`

### Requirement: Consulta de mis likes
El sistema SHALL ofrecer a un usuario autenticado la lista de ids de álbumes a los que ha dado like mediante `GET /likes`.

#### Scenario: Usuario con likes
- **WHEN** un usuario que dio like a `cody-espacio` hace `GET /likes`
- **THEN** la respuesta es 200 con `{ albumIds: ["cody-espacio"] }`

#### Scenario: Usuario sin likes
- **WHEN** un usuario sin likes hace `GET /likes`
- **THEN** la respuesta es 200 con `{ albumIds: [] }`
