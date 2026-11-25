# Spec: Onboarding — primera estampa en la misma sesión

> Estado: **implementado** (spec, plan, tasks e implementación completos).

## 1. Intención

Quien crea una cuenta debe **añadir al menos una estampa a su álbum en esa misma sesión de registro**, sin pasos intermedios ni abandonos.

**Por qué:** es parte de la estrategia de adquisición de la empresa. Un usuario que ya posee una estampa ha experimentado el valor del producto (coleccionar) y es más probable que regrese. Hoy, tras el registro, el usuario aterriza en `/<username>` con solo su nombre, su correo y un botón "Ver álbumes": no hay ninguna acción que lo enganche.

**Métrica de éxito:** porcentaje de cuentas nuevas que añaden ≥ 1 estampa en la misma sesión en que se registraron (*activación*). Esta spec no fija un objetivo numérico (ver preguntas abiertas).

## 2. Situación actual (verificada en el código)

- Signup/login devuelven un JWT (1h); la app lo guarda en cookie httpOnly `session` y redirige a `/<username>` (`apps/albumcito-facilito-app/src/app/actions.ts`).
- `GET /albums` y `GET /albums/:id/stickers` son públicos y devuelven el catálogo (3 álbumes, 12 estampas en memoria).
- **No existe colección de usuario**: ningún endpoint ni modelo registra qué estampas posee cada usuario.
- No hay base de datos; los usuarios viven en memoria.

## 3. Historia de usuario

Como **persona que acaba de crear su cuenta**, quiero **elegir un álbum y añadir mi primera estampa inmediatamente**, para **empezar mi colección y ver mi progreso desde el primer minuto**.

## 4. Alcance

### Dentro

1. **Flujo de onboarding** que se muestra tras un *signup* exitoso (no tras login), antes del dashboard.
2. **Elegir álbum → elegir estampa → añadirla**, reutilizando el catálogo existente.
3. **Colección mínima en la API**: registrar que un usuario autenticado posee una estampa y consultar su colección.
4. **Confirmación visual** de la estampa añadida y salida clara hacia `/<username>`.
5. **Dashboard** (`/<username>`) que refleje la(s) estampa(s) del usuario.
6. **Omitir** el onboarding (el usuario no queda bloqueado).

### Fuera

- Quitar estampas, intercambios, estampas repetidas/cantidades, o marcar progreso por álbum más allá de mostrar lo que posee.
- Base de datos real: el campo `onboarding` vive en el repositorio en memoria (`UsersRepository`); migrar a BD será otro cambio.
- Proveedor externo de analítica: el evento es in-process + log JSON.
- Emails de bienvenida, analítica externa, A/B testing.
- Rediseño de login/signup.
- Onboarding para usuarios existentes que inician sesión.

## 5. Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-1 | Tras un signup exitoso, el usuario es redirigido al onboarding, no directo al dashboard. |
| RF-2 | El onboarding lista los álbumes disponibles y permite ver sus estampas. |
| RF-3 | El usuario puede añadir una estampa a su colección con una sola acción (un clic/tap sobre la estampa y confirmar). |
| RF-4 | Al añadir con éxito, se muestra confirmación y un llamado a la acción hacia `/<username>`. |
| RF-5 | El usuario puede omitir el onboarding y llegar a `/<username>` sin añadir estampa. |
| RF-6 | La API expone endpoints autenticados (Bearer) para añadir una estampa a la colección del usuario y para consultar su colección. |
| RF-7 | Añadir una estampa que ya se posee es idempotente (no duplica ni falla). |
| RF-8 | El dashboard muestra las estampas que el usuario posee. |
| RF-9 | Un usuario no puede leer ni modificar la colección de otro. |
| RF-10 | Si el usuario ya tiene ≥ 1 estampa o ya completó/omitió el onboarding, no se le vuelve a mostrar al volver a `/onboarding`. |
| RF-11 | El usuario tiene un campo `onboarding: boolean \| null`, `null` por defecto. Al crear la cuenta (signup) pasa a `false`; al añadir su primera estampa pasa a `true`. Omitir el flujo no lo cambia. |
| RF-12 | El usuario guarda `createdAt` (ISO) al crearse la cuenta. `GET /auth/me` expone `onboarding`. |
| RF-13 | Al añadir la **primera** estampa de un usuario con `onboarding === false`, se emite una sola vez el evento de dominio `onboarding.completed` con `{ userId, accountCreatedAt, firstStickerAt, durationMs }`, y se registra como log JSON estructurado. |
| RF-14 | Usuarios con `onboarding === null` (cuentas previas) no cambian de valor ni emiten el evento. |

## 6. Requisitos no funcionales

- Un solo cambio coordinado backend + frontend (el contrato de la API cambia).
- El token JWT sigue en cookie httpOnly; las llamadas con Bearer se hacen solo desde el servidor (Server Actions), como el resto de la app.
- Errores de la API (estampa/álbum inexistente, token expirado) se muestran con mensaje claro y sin perder el estado del flujo; token expirado redirige a `/login`.
- Accesible por teclado y legible en móvil (el registro suele ocurrir desde móvil).

## 7. Criterios de aceptación

```gherkin
Escenario: Un usuario nuevo añade su primera estampa
  Dado que me acabo de registrar con éxito
  Entonces veo la pantalla de onboarding con los álbumes disponibles
  Cuando elijo "Las aventuras de Cody" y añado la estampa "Cody despierta"
  Entonces veo una confirmación de que la estampa fue añadida
  Y al continuar llego a mi dashboard donde aparece "Cody despierta"

Escenario: Omitir el onboarding
  Dado que me acabo de registrar con éxito
  Cuando elijo omitir
  Entonces llego a mi dashboard sin estampas

Escenario: Añadir una estampa repetida
  Dado que ya tengo la estampa "Cody despierta"
  Cuando intento añadirla de nuevo
  Entonces mi colección sigue teniéndola una sola vez y no veo error

Escenario: Acceso sin autenticar
  Cuando solicito añadir una estampa sin token válido
  Entonces la API responde 401

Escenario: Estampa inexistente
  Cuando intento añadir una estampa que no existe
  Entonces la API responde 404 y el onboarding muestra un mensaje de error

Escenario: Estado del campo onboarding
  Cuando creo una cuenta
  Entonces mi perfil muestra onboarding = false
  Cuando añado mi primera estampa
  Entonces mi perfil muestra onboarding = true

Escenario: Evento de tiempo hasta la primera estampa
  Dado que creé mi cuenta hace 90 segundos
  Cuando añado mi primera estampa
  Entonces se emite una vez "onboarding.completed" con durationMs = 90000
  Y añadir una segunda estampa no vuelve a emitirlo

Escenario: Login no dispara onboarding
  Dado que ya tengo una cuenta
  Cuando inicio sesión
  Entonces llego directo a mi dashboard
```

## 8. Supuestos

- El catálogo actual (3 álbumes / 12 estampas) es suficiente para el onboarding.
- Una estampa se identifica por su `id` global (`aventuras-1`, `espacio-2`, …), único entre álbumes.
- "Misma sesión" = el flujo continúa inmediatamente después del signup, sin requerir un nuevo login.

## 9. Preguntas abiertas (a resolver antes del plan)

1. **¿Obligatorio u omitible?** Propongo **omitible** (RF-5) para no bloquear el registro; si debe ser obligatorio, cambia RF-5 y RF-10.
2. **¿Una estampa o varias?** Propongo permitir añadir una y ofrecer "añadir otra" opcionalmente; el mínimo de éxito es 1.
3. ~~¿Se mide la activación?~~ **Resuelto:** evento `onboarding.completed` con `durationMs` (RF-13).
4. **¿Dónde vive el flujo?** Propongo la ruta `/onboarding` dedicada (no un modal sobre el dashboard).
