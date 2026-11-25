# Proposal

## Why

Hoy un álbum o una estampa solo se puede ver dentro de la app. Los coleccionistas quieren presumir sus álbumes y pedir estampas a amigos; compartir en redes sociales trae tráfico nuevo y alimenta la señal de popularidad ya existente (likes, rankings).

## What Changes

- Botón "Compartir" en cada tarjeta de álbum (home) y en el detalle del álbum (`/albums/[id]`), y en cada estampa del detalle.
- Al pulsarlo se abre un modal con las opciones: Facebook, X (Twitter), WhatsApp, Telegram, correo electrónico y "Copiar enlace"; si el navegador soporta Web Share API, también "Compartir con…" del sistema.
- El enlace compartido es la URL pública del álbum (para una estampa, la del álbum con ancla a la estampa) acompañada de un texto breve.
- Solo frontend: no hay cambios en el contrato de la API ni nuevas dependencias.

## Capabilities

### New Capabilities
- `social-sharing`: compartir álbumes y estampas hacia redes sociales, apps de mensajería y portapapeles mediante un modal de opciones.

### Modified Capabilities
<!-- Ninguna: no cambian requisitos de album-likes ni home-highlights. -->

## Impact

- `apps/albumcito-facilito-app`: nuevos componentes `share-button` (client) y utilidades `lib/share.ts`, cambios en `app/page.tsx` (AlbumCard) y `app/albums/[id]/page.tsx`; tests Vitest + BDD.
- `services/albumcito-facilito-api`: sin cambios.
- Dependencias: ninguna (enlaces de compartir de cada red, `<dialog>` nativo, `navigator.clipboard`).
- Fuera de alcance: previsualizaciones enriquecidas (Open Graph/imágenes por álbum), analítica de compartidos, contador de compartidos.
