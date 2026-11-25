# Spec Delta

## Purpose

Permite ver una estampa en grande en una vista modal desde el detalle de álbum y la colección del usuario, con transición animada de apertura y cierre.

## ADDED Requirements

### Requirement: Abrir estampa en vista ampliada
Al hacer clic (o activar con teclado) una estampa en `/albums/[id]` o en la colección `/[username]`, el sistema SHALL mostrar un visor modal con la estampa ampliada: número y nombre.

#### Scenario: Clic en estampa del álbum
- **WHEN** el usuario hace clic en la estampa #3 en `/albums/[id]`
- **THEN** se abre un diálogo modal con la estampa #3 en tamaño grande, con animación de entrada

#### Scenario: Activación por teclado
- **WHEN** el usuario enfoca una estampa y pulsa Enter o Espacio
- **THEN** se abre el mismo visor

#### Scenario: Colección del usuario
- **WHEN** el usuario hace clic en una estampa de su colección en `/[username]`
- **THEN** se abre el visor con esa estampa

### Requirement: Cerrar la vista ampliada
El visor SHALL poder cerrarse con un botón "Cerrar", la tecla Escape o clic en el fondo, con animación de salida, y devolver el foco a la estampa que lo abrió.

#### Scenario: Cerrar con Escape
- **WHEN** el visor está abierto y el usuario pulsa Escape
- **THEN** el visor se cierra y el foco vuelve a la estampa de origen

#### Scenario: Cerrar con clic en el fondo
- **WHEN** el usuario hace clic fuera del contenido del visor
- **THEN** el visor se cierra

### Requirement: Accesibilidad del visor
Mientras está abierto, el visor MUST comportarse como diálogo modal: contenido de fondo inerte, foco contenido dentro y nombre accesible con el nombre de la estampa.

#### Scenario: Diálogo modal
- **WHEN** el visor se abre
- **THEN** existe un elemento con rol `dialog` cuyo nombre accesible incluye el nombre de la estampa y el foco queda dentro de él

### Requirement: Onboarding sin cambios
En `/onboarding`, el clic sobre una estampa SHALL seguir añadiéndola a la colección y MUST NOT abrir el visor.

#### Scenario: Clic en onboarding
- **WHEN** el usuario hace clic en una estampa en `/onboarding`
- **THEN** se añade a su colección y no se abre ningún visor
