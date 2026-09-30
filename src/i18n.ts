import { createI18n } from 'vue-i18n'

export const defaultCardLanguage = 'es'

export const cardLanguageCodes = ['en', 'es', 'ja', 'de', 'fr'] as const

export const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'es',
  messages: {
    es: {
      cardLanguages: {
        en: 'Inglés',
        es: 'Español',
        ja: 'Japonés',
        de: 'Alemán',
        fr: 'Francés',
      },
      hero: {
        kicker: 'MTG PROXY PRINTER / 01',
        title: 'Cartas listas.',
        titleAccent: 'Caos controlado.',
        lead: 'Convierte una lista en proxies imprimibles a tamaño real. Sin middleware raro, sin rehacerlo todo por una carta.',
        stickerLine1: 'MAKE IT',
        stickerLine2: 'PRINTABLE',
      },
      import: {
        kicker: '01 / CARGA RÁPIDA',
        title: 'Pega tu lista',
        badge: 'NOMBRE = 1',
        description:
          'Una carta por línea. El nombre es suficiente: la cantidad empieza en 1. También puedes usar',
        placeholder:
          'Lightning Bolt\n2 Counterspell (STA)\nSheoldred, the Apocalypse',
        example: '2 Lightning Bolt (STA)',
        label: 'Lista de cartas',
        convert: 'Convertir en filas',
      },
      workspace: {
        kicker: '02 / AJUSTA SIN MIEDO',
        title: 'Tu lista, en filas',
        empty: 'Importa una lista o añade una fila para empezar.',
        add: '+ Añadir carta',
      },
      language: {
        global: 'Idioma global',
        card: 'Idioma de la carta',
      },
      row: {
        name: 'Nombre',
        quantity: 'Cantidad',
        set: 'Set opcional',
        loading: 'Buscando…',
        editions: '{count} edición | {count} ediciones',
        error: 'Error al buscar',
        pending: 'Pendiente',
        cardNameLabel: 'Nombre de la carta',
        duplicate: 'Duplicar',
        search: 'Buscar',
        remove: 'Quitar',
      },
      result: {
        selectedEdition: 'EDICIÓN SELECCIONADA',
        printing: 'Edición de la carta',
        empty: 'Sin impresión seleccionada.',
        languageUnavailable:
          'No hay una impresión disponible en {language}. Elige otro idioma o edición.',
        languageFallback:
          'No hay una impresión en {requested}. Se muestra la versión en {fallback}.',
      },
      readiness: {
        kicker: '03 / LISTO PARA SALIR',
        prepared: '{count} proxies preparados',
        unresolved: 'Faltan {count} fila(s) por resolver antes de imprimir.',
        complete: 'Todo resuelto. Revisa el tamaño y dispara la impresión.',
        print: 'Imprimir hojas',
      },
      preview: {
        kicker: '04 / VISTA DE IMPRESIÓN',
        title: 'Tu hoja, a tamaño real',
        size: '63 × 88 MM',
        note: 'Imprime al 100 % y desactiva cualquier ajuste automático de escala.',
        empty: 'Resuelve alguna carta para ver la cuadrícula 3x3.',
        inkSaving: 'Filtro texto / ahorrar tinta',
        inkSavingHelp:
          'Aclara las zonas oscuras y elimina el color sin destruir el texto al imprimir.',
      },
      navigation: {
        backToTop: 'Volver arriba',
      },
      errors: {
        missingName: 'Escribe un nombre antes de buscar.',
        notFound: 'No encontramos esa carta en Scryfall.',
        searchFailed: 'No se pudo buscar la carta.',
        inkSavingProcessing:
          'No se pudo preparar una imagen para ahorrar tinta.',
        parseLine: 'Línea {line}: {message}',
      },
    },
  },
})
