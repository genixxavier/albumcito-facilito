# Design

## Context

Frontend Next.js 16 (App Router). La home renderiza `AlbumCard` (Server Component) con `LikeButton` como único client component; el detalle `/albums/[id]` es un Server Component sin interactividad. Las estampas no tienen página propia. Ver proposal.md para motivación.

## Goals / Non-Goals

**Goals:**
- Un único componente reutilizable para álbum y estampa.
- Sin dependencias nuevas ni cambios de API.

**Non-Goals:**
- Open Graph/imágenes dinámicas, analítica de compartidos, página propia por estampa.

## Decisions

- **`ShareButton` (client) + `<dialog>` nativo.** El botón recibe `{ title, path, text, label }` y controla un `<dialog>` con `showModal()`. Da modal accesible (focus trap, Escape, `::backdrop`, devolución de foco) sin librería. Alternativas: Radix/Headless UI (dependencia nueva para un solo modal); modal propio con `div` (hay que reimplementar accesibilidad).
- **Props serializables, URL absoluta en el cliente.** El servidor pasa `path` (`/albums/<id>` o con `#sticker-<id>`); el cliente lo resuelve con `window.location.origin` al abrir. Evita una variable `SITE_URL` y funciona en cualquier entorno. Alternativa: `NEXT_PUBLIC_SITE_URL` (más config y riesgo de desajuste).
- **Constructores de URL puros en `src/lib/share.ts`.** `buildShareLinks({ url, text })` devuelve la lista `{ id, label, href }` para Facebook (`facebook.com/sharer/sharer.php?u=`), X (`twitter.com/intent/tweet?url=&text=`), WhatsApp (`wa.me/?text=`), Telegram (`t.me/share/url?url=&text=`) y correo (`mailto:?subject=&body=`), usando `encodeURIComponent`. Testeables sin DOM. Los endpoints se verificarán contra documentación vigente al implementar.
- **Enlaces `<a target="_blank" rel="noopener noreferrer">`**, no `window.open`: no los bloquea el bloqueador de pop-ups y funcionan con clic medio.
- **Copiar y Web Share con degradación.** `navigator.clipboard.writeText` en try/catch; si falla, campo `readOnly` con la URL seleccionada. "Compartir con…" solo si `typeof navigator.share === "function"` (comprobado tras montar para evitar mismatch de hidratación); se ignora `AbortError`.
- **Ancla de estampa.** `id="sticker-<id>"` en cada `<li>` del detalle y `scroll-mt` para el desplazamiento; el navegador resuelve el hash sin JS extra.
- **Integración en la tarjeta.** El botón va en el pie de `AlbumCard` junto a `LikeButton`, fuera del `<Link>` para no anidar interactivos ni navegar.
- **Textos en español**, consistente con la app.

## Risks / Trade-offs

- [Los endpoints de compartir de las redes cambian o requieren parámetros adicionales (p. ej. Facebook exige URL pública)] → centralizados en `share.ts` con tests; en `localhost` Facebook no podrá previsualizar, se documenta.
- [Sin Open Graph, las redes muestran vista previa pobre] → fuera de alcance; el texto compartido ya incluye título y URL.
- [Un `<dialog>` por tarjeta multiplica nodos en listas largas] → renderizar el `<dialog>` solo mientras está abierto.
- [El ancla `#sticker-…` no resalta la estampa] → aceptable; se puede añadir estilo `:target`.
