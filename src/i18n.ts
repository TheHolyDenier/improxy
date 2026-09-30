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
        title: 'Improxy.',
        titleAccent: 'Caos (des)controlado.',
        stickerLine1: 'MAKE IT',
        stickerLine2: 'PRINTABLE',
      },
      import: {
        kicker: '01 / CARGA RÁPIDA',
        title: 'Pega tu lista',
        badge: 'NOMBRE = 1',
        description: 'Una carta por línea. El nombre basta. Ejemplo:',
        placeholder:
          'Lightning Bolt\n2 Counterspell (STA)\nSheoldred, the Apocalypse',
        example: '2 Lightning Bolt (STA)',
        label: 'Lista de cartas',
        convert: 'Convertir en filas',
      },
      workspace: {
        kicker: '02 / AJUSTA SIN MIEDO',
        title: 'Ajusta tu lista.',
        empty: 'Importa una lista o añade una fila para empezar.',
        add: '+ Añadir carta',
      },
      language: {
        global: 'Idioma por defecto',
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
        kicker: '03 / LISTO PARA JUGAR',
        prepared: '{count} proxy listo | {count} proxies listos',
        empty: 'Añade las cartas que quieras imprimir.',
        unresolved:
          'Resuelve {count} fila pendiente antes de imprimir. | Resuelve {count} filas pendientes antes de imprimir.',
        complete:
          'Revisa la edición y el idioma de cada carta. Después, imprime al 100 %.',
        print: 'Imprimir proxies',
      },
      preview: {
        kicker: '04 / PREPARA LA IMPRESIÓN',
        title: 'Tu hoja, a tamaño real',
        size: '63 × 88 MM',
        note: 'Imprime al 100 % y desactiva cualquier ajuste automático de escala.',
        empty: 'Añade al menos una carta para ver la cuadrícula 3x3.',
        inkSaving: 'Ahorro de tinta',
        inkSavingHelp:
          'Aclara las imágenes y las pasa a escala de grises para reducir el consumo de tinta.',
      },
      navigation: {
        backToTop: 'Subir al inicio',
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
