# Proposal

## Why

Crear una aplicación sencilla para convertir listas de cartas de Magic: The Gathering en hojas de proxies listas para imprimir. La herramienta debe reducir el trabajo manual de buscar cartas, elegir la edición y el idioma, y ajustar una composición 3x3 con las dimensiones físicas de una carta original sin obligar al usuario a rehacer toda la lista por cada pequeño cambio.

## What Changes

- Aceptar como entrada mínima el nombre de la carta; la cantidad inicial será `1`.
- Aceptar opcionalmente cantidad y set en el formato `[cantidad] [nombre] ([set])`.
- Convertir la lista importada en filas editables donde nombre, cantidad, set, idioma e impresión puedan modificarse de forma independiente.
- Permitir añadir y quitar filas sin recargar la aplicación, repetir búsquedas ni perder selecciones de otras cartas.
- Buscar cartas mediante la API de Scryfall y presentar resultados claros, incluyendo alternativas cuando una búsqueda no sea exacta.
- Permitir seleccionar manualmente la edición/impresión concreta de cada carta, usando la imagen de la carta como ayuda visual.
- Permitir elegir idioma por carta y aplicar un idioma global al listado.
- Generar una vista de impresión en una cuadrícula 3x3, con tamaño real de carta y paginación cuando el listado exceda una hoja.
- Añadir controles de revisión antes de imprimir: cartas sin resolver, edición elegida, idioma y cantidad total.
- Crear una interfaz visual llamativa, energética y de estética femenina/enfadada, basada en componentes shadcn-vue.
- Configurar TypeScript idiomático de Vue, `async`/`await`, tests por componente, lint y Prettier con comillas simples.
- Mantener la integración con Scryfall lo más directa y comprensible posible, sin copiar el middleware confuso del proyecto de referencia.

## Capabilities

### New Capabilities

- `card-list-import`: Parseo flexible y edición incremental de listados de cartas con nombre obligatorio, cantidad por defecto y set opcional.
- `scryfall-card-search`: Búsqueda de cartas e impresiones en Scryfall, selección manual de edición e idioma.
- `proxy-sheet-printing`: Composición e impresión de proxies en hojas 3x3 con dimensiones físicas de carta.
- `proxy-workspace`: Flujo de revisión y gestión incremental del estado de la aplicación desde la carga del listado hasta la impresión.

### Modified Capabilities

<!-- No existing capabilities are defined in this project. -->

## Impact

- Reemplazo de la pantalla de ejemplo de Vue en `src/App.vue` por el flujo principal de la aplicación.
- Nuevos componentes Vue, composables, tipos y servicios para parseo, edición incremental, búsqueda, selección e impresión.
- Incorporación de shadcn-vue y de las dependencias de testing, linting y formateo que se acuerden en el diseño.
- Integración con la API pública de Scryfall desde una capa aislada y tipada.
- Nuevas pruebas unitarias y de componentes para cada componente creado o modificado.
- La impresión dependerá de las capacidades CSS de impresión del navegador y deberá documentar cualquier limitación visible.
