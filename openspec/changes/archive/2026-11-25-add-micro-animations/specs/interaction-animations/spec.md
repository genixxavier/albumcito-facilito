# Spec Delta

## Purpose

Define la retroalimentación visual animada de la interfaz ante hover, foco y cambios de estado del botón de me gusta, sin afectar la accesibilidad ni a usuarios con movimiento reducido.

## ADDED Requirements

### Requirement: Animación de hover en tarjetas
Las tarjetas de álbum y de estampas top SHALL mostrar una transición animada (elevación y/o escala sutil) al recibir hover o foco de teclado, y volver a su estado base al perderlos.

#### Scenario: Hover sobre tarjeta de álbum
- **WHEN** el usuario pasa el puntero sobre una tarjeta de álbum
- **THEN** la tarjeta se eleva con una transición de duración menor a 300 ms

#### Scenario: Foco por teclado
- **WHEN** el usuario enfoca con teclado el enlace de una tarjeta
- **THEN** la tarjeta muestra el mismo estado destacado que en hover

### Requirement: Animación del botón de me gusta
El botón de me gusta SHALL animar el cambio de estado: al dar like el corazón realiza un "pop" y al quitarlo transiciona suavemente; el contador MUST seguir mostrando el valor optimista actual.

#### Scenario: Dar like
- **WHEN** el usuario pulsa "Me gusta" en un álbum sin like
- **THEN** el corazón se rellena con una animación de pop y el contador aumenta en 1

#### Scenario: Quitar like
- **WHEN** el usuario pulsa "Quitar me gusta"
- **THEN** el corazón vuelve a su estado vacío con una transición suave y el contador disminuye en 1

#### Scenario: Pulsación
- **WHEN** el usuario mantiene pulsado el botón
- **THEN** el botón se reduce ligeramente de escala mientras está activo

### Requirement: Respeto de movimiento reducido
Con `prefers-reduced-motion: reduce`, las animaciones de hover, like y visor SHALL desactivarse o reducirse a cambios sin movimiento (p. ej. solo color u opacidad).

#### Scenario: Movimiento reducido activo
- **WHEN** el sistema del usuario declara `prefers-reduced-motion: reduce`
- **THEN** ninguna tarjeta, botón ni visor aplica transformaciones animadas de escala o desplazamiento

### Requirement: Estados funcionales intactos
Las animaciones MUST NOT alterar etiquetas accesibles, `aria-pressed`, navegación ni la acción de like existente.

#### Scenario: Accesibilidad del like
- **WHEN** el botón cambia de estado
- **THEN** `aria-pressed` y `aria-label` reflejan el estado nuevo igual que antes de la animación
