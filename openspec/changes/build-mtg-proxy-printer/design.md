# Design

## Context

El proyecto actual es una plantilla mínima de Vue 3 con Vite y TypeScript, sin capacidades de dominio ni pruebas configuradas. La implementación debe reemplazar la pantalla de ejemplo y mantener una arquitectura comprensible, directa e idiomática de Vue. La motivación y el alcance funcional están en `proposal.md`; los contratos observables están en las cuatro especificaciones de este cambio.

## Goals / Non-Goals

**Goals:**

- Separar el dominio de cartas, la integración con Scryfall, el estado de la interfaz y la composición de impresión.
- Mantener la lógica de negocio testeable fuera de los templates y reducir los casts mediante tipos explícitos y validación de respuestas.
- Crear componentes Vue pequeños basados en shadcn-vue, con una prueba para cada componente creado o modificado.
- Hacer que el flujo funcione inicialmente como aplicación frontend directa, sin introducir un middleware de servidor innecesario.
- Configurar async/await, lint y Prettier con comillas simples desde el principio.
- Hacer que el workspace sea incremental: editar, añadir o quitar una fila no debe reiniciar el resto de la sesión.

**Non-Goals:**

- No se copiará la arquitectura ni el middleware del proyecto de referencia.
- No se construirá autenticación, persistencia de cuentas, inventario de colecciones ni edición de imágenes.
- No se garantiza soporte para impresoras específicas más allá del flujo de impresión estándar del navegador.
- No se implementará un generador de proxies con reglas de falsificación, hologramas o sustitución de elementos de autenticidad; el alcance es una hoja de impresión para uso personal.
- No se forzará un wizard rígido ni una recarga completa entre etapas.

## Decisions

### Arquitectura por capas con dominio tipado

Se definirán tipos de dominio para entradas de lista, cartas, impresiones, preferencias de idioma y trabajos de impresión. Las reglas puras, como parsear cantidades, expandir copias y calcular páginas, vivirán en módulos de dominio independientes de Vue.

Las clases se reservarán para responsabilidades con estado o dependencias claras: un cliente de Scryfall, un parser de lista y un compositor de hojas. Las funciones puras seguirán siendo funciones cuando no exista una razón para añadir una clase. Esto respeta la preferencia de orientación a objetos sin convertir cada dato o componente en una abstracción artificial.

**Alternativa considerada:** concentrar toda la lógica en un composable de `App.vue`. Se descarta porque dificulta las pruebas, mezcla IO con presentación y haría confuso el flujo de errores.

### Cliente Scryfall directo y aislado

Se implementará un cliente tipado que use `fetch` y `async`/`await`, con métodos explícitos para buscar cartas y obtener impresiones relacionadas. El cliente validará el mínimo de la respuesta externa antes de convertirla a modelos internos y convertirá errores HTTP, red y datos inválidos en errores de dominio recuperables.

La aplicación llamará directamente a Scryfall desde el navegador para evitar un middleware propio en esta primera versión. Se respetarán los límites y recomendaciones de la API, se evitarán solicitudes duplicadas y se conservarán resultados ya resueltos si una solicitud posterior falla.

**Alternativa considerada:** crear un backend proxy desde el inicio. Se descarta porque añade despliegue, configuración y una segunda superficie de mantenimiento sin una necesidad funcional identificada.

### Estado incremental por fila

Cada fila del workspace tendrá una identidad estable generada al importarla o añadirla. Su estado se mantendrá separado: datos introducidos por el usuario, estado de búsqueda, resultados, selección de impresión, idioma, errores y cantidad.

Las acciones actualizarán solo la fila afectada y derivarán los totales, copias imprimibles y páginas desde la colección actual. Añadir una fila solo creará una nueva entrada pendiente; eliminarla quitará esa identidad y sus copias; editar cantidad o datos no reconstruirá ni invalidará filas no relacionadas. La interfaz usará reactividad directa de Vue y componentes controlados por props/emits, no un patrón de renderizado o estado inspirado en React.

La entrada inicial podrá ser un textarea para pegar muchas líneas, pero después de importar se convertirá en una colección de filas editables. Así se mantiene la rapidez del pegado masivo sin sacrificar flexibilidad para ajustes pequeños.

**Alternativa considerada:** mantener un único texto como fuente de verdad y volver a parsear toda la lista tras cada cambio. Se descarta porque puede resetear estados, repetir búsquedas y hacer que quitar o añadir una carta resulte pesado.

### Arquitectura por eventos locales, no recarga global

Las filas emitirán acciones semánticas como añadir, eliminar, actualizar detalles, cambiar cantidad, seleccionar impresión y reintentar búsqueda. El coordinador del workspace aplicará esas acciones de forma localizada y conservará las promesas o resultados asociados a otras identidades.

Las búsquedas se ejecutarán solo para filas nuevas o modificadas que lo necesiten. Un cambio de cantidad no volverá a consultar Scryfall, porque no cambia la carta ni la impresión. Un cambio de idioma o edición se resolverá con los resultados disponibles cuando sea posible.

### Impresión basada en CSS físico

La vista imprimible usará una zona dedicada con `@media print`, saltos de página y una cuadrícula de tres columnas por tres filas. Cada celda tendrá `width: 63mm` y `height: 88mm`; el papel tendrá A4 como formato inicial y se mantendrá una configuración aislada para poder añadir Letter si las pruebas reales lo requieren.

El diseño mostrará una advertencia para usar escala del navegador al 100 %. Las pruebas automatizadas verificarán los cálculos de páginas, copias y dimensiones declaradas; las comprobaciones físicas quedarán como validación manual del flujo. Los cambios incrementales en filas o cantidad recalcularán solo la proyección imprimible, sin recargar la página.

**Alternativa considerada:** generar un PDF en el cliente. Se descarta para la primera versión porque añade una dependencia de renderizado y puede introducir otra conversión de escala.

### Testing y calidad

Se añadirá Vitest con Vue Test Utils para pruebas unitarias de dominio, pruebas del cliente Scryfall con respuestas simuladas y pruebas de cada componente Vue creado o modificado. Las pruebas cubrirán especialmente añadir, quitar, editar y cambiar cantidad sin perder estado de filas no afectadas.

ESLint se configurará para Vue y TypeScript, y Prettier se configurará con comillas simples. Los scripts de `package.json` incluirán lint, format check y test junto al type-check y build existentes.

## Risks / Trade-offs

- [Dependencia de Scryfall] → Mostrar errores recuperables, conservar resultados previos, evitar búsquedas duplicadas y permitir reintentar.
- [Estado incremental más rico] → Usar identidades estables, acciones semánticas y pruebas de aislamiento entre filas.
- [Limitaciones de escala del navegador o impresora] → Usar unidades físicas, advertir sobre escala al 100 % y validar manualmente una hoja de prueba.
- [Variación de imágenes entre impresiones] → Tratar la impresión seleccionada como una entidad explícita y mostrar su preview antes de imprimir.
- [CORS o cambios de contrato de Scryfall] → Aislar el cliente, validar respuestas y mantener el punto de sustitución preparado para un backend futuro sin mezclarlo con los componentes.
- [Sobrecarga visual] → Reservar colores intensos y recursos gráficos para la jerarquía principal, manteniendo contraste, foco visible y estados accesibles.

## Migration Plan

1. Añadir dependencias y configuración de calidad sin cambiar todavía el flujo de usuario.
2. Implementar dominio y cliente Scryfall con pruebas.
3. Implementar el modelo de filas estables y las acciones incrementales con pruebas de aislamiento.
4. Implementar workspace y componentes shadcn-vue con sus pruebas.
5. Implementar composición de impresión y pruebas de layout.
6. Ejecutar type-check, lint, tests y build; revisar manualmente una hoja impresa.

El rollback consiste en revertir los cambios del frontend y las dependencias añadidas; no hay migraciones de datos ni cambios de servidor en esta fase.
