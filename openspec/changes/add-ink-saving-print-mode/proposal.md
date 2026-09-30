# Proposal

## Why

Las imágenes a color de las cartas consumen mucha tinta cuando se imprimen en blanco y negro, y los fondos oscuros pueden reducir la legibilidad. La aplicación necesita un modo opcional que reduzca la cobertura de tinta sin cambiar las dimensiones físicas ni la composición de las cartas.

## What Changes

- Añadir un control explícito para activar o desactivar el modo de ahorro de tinta.
- Aplicar el tratamiento visual únicamente a la vista imprimible, manteniendo intacta la previsualización normal del workspace.
- Usar un filtro de impresión en blanco y negro con contraste suficiente para conservar texto, bordes y símbolos reconocibles.
- Mostrar una indicación visible cuando el modo de ahorro de tinta esté activo.
- Mantener el tamaño 63 × 88 mm, la cuadrícula 3x3, la paginación y el flujo del diálogo de impresión.
- Recordar la preferencia durante la sesión actual sin convertirla en una configuración persistente de cuenta.
- Añadir pruebas de componentes y de impresión para verificar el estado activo/inactivo y la presencia del tratamiento solo en la región imprimible.

## Capabilities

### New Capabilities

- `ink-saving-printing`: Permite preparar las hojas de proxies para impresión en blanco y negro con menor cobertura de tinta y una indicación clara del modo aplicado.

### Modified Capabilities

<!-- No existing main capabilities are defined in this project. -->

## Impact

- `ProxyPrintPreview.vue` y la composición del workspace para exponer el control y su estado.
- CSS de impresión para aplicar el filtro únicamente durante la impresión.
- Estado del workspace para conservar la preferencia durante la sesión.
- Catálogo i18n para etiquetas, aviso y ayuda contextual del nuevo control.
- Nuevas pruebas de componente y de integración de impresión.
- No requiere cambios en la API de Scryfall ni nuevas dependencias externas.
