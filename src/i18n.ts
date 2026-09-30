import { createI18n } from 'vue-i18n'

export const defaultCardLanguage = 'es'

export const cardLanguageCodes = ['en', 'es', 'ja', 'de', 'fr'] as const
export const cardLanguageOptions = cardLanguageCodes.map((value) => ({
  value,
  label: value.toUpperCase(),
}))

export const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'es',
  messages: {
    es: {
      cardLanguages: {
        en: 'inglés',
        es: 'español',
        ja: 'japonés',
        de: 'alemán',
        fr: 'francés',
      },
      hero: {
        title: 'Improxy.',
        titleAccent: 'Caos (des)controlado.',
        stickerLine1: 'MAKE IT',
        stickerLine2: 'PRINTABLE',
      },
      import: {
        kicker: '01 / Añade tus cartas',
        title: 'Pon las cartas sobre la mesa',
        subtitle: 'Añade tu lista',
        badge: 'NOMBRE = 1',
        description: 'Una carta por entrada. El nombre basta. Ejemplo:',
        placeholder:
          'Lightning Bolt\n2 Counterspell e:STA\nSheoldred, the Apocalypse',
        example: '2 Lightning Bolt e:STA',
        label: 'Lista de cartas',
        convert: 'Añadir cartas',
        quickAdd: 'Añadir carta',
        loading: 'Cargando…',
        quickAddLabel: 'Añadir carta por nombre o sintaxis',
        quickAddPlaceholder: 'Lightning Bolt e:INR cn:13',
      },
      workspace: {
        kicker: '02 / Elige idioma y edición',
        title: 'Escoge tu veneno',
        subtitle: 'Edita tus cartas',
        empty: 'Añade una lista o una carta para empezar.',
        add: '+ Añadir carta',
      },
      workflow: {
        editKicker: '02 / AJUSTA EL MAZO A TU GUSTO',
        editTitle: 'Edita tus cartas',
        editSubtitle:
          'Corrige cantidades, ediciones e idiomas. Las búsquedas se actualizan solas.',
        printKicker: '03 / A IMPRIMIR SE HA DICHO',
        printTitle: 'Imprime tus proxies',
        printSubtitle:
          'Revisa la hoja, mantén la escala al 100 % y dale al botón.',
      },
      language: {
        global: 'Idioma',
        card: 'Idioma',
      },
      row: {
        name: 'Nombre',
        quantity: 'Cantidad',
        set: 'Edición',
        collectorNumber: 'N.º de carta',
        loading: 'Buscando…',
        editions: '{count} edición | {count} ediciones',
        error: 'No se pudo encontrar',
        readyToEdit: 'Lista para editar',
        cardNameLabel: 'Nombre de la carta',
        decreaseQuantity: 'Reducir cantidad',
        increaseQuantity: 'Aumentar cantidad',
        remove: 'Eliminar carta',
        duplicate: 'Duplicar carta',
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
        kicker: '03 / Pulsa imprimir',
        title: 'Calienta rodillos',
        prepared: '{count} proxy listo | {count} proxies listos',
        empty: 'Añade al menos una carta válida para imprimir.',
        adjusting: 'Estamos terminando de encontrar alguna carta.',
        complete:
          'Revisa la edición y el idioma de cada carta. Después, imprime al 100 %.',
        print: 'Imprimir proxies',
        loading: 'Preparando…',
        unresolved:
          '{count} carta pendiente de resolver | {count} cartas pendientes de resolver',
      },
      preview: {
        title: 'Tu hora del Juan Palomo',
        subtitle: 'Puedes revisar la previsualización antes de imprimirla',
        size: '63 × 88 MM',
        page: 'Página {current} de {total}',
        empty: 'Añade al menos una carta para ver la cuadrícula 3x3.',
        inkSaving: 'B/N',
        processing: 'Preparando {count} imagen | Preparando {count} imágenes',
        processingFailed:
          'No se pudieron preparar {count} imágenes; se mostrarán con el filtro de ahorro disponible.',
        disclaimer:
          'Proxies hechos para uso personal y sin ánimo de lucro. No se venden ni se distribuyen. Los datos e imágenes de las cartas proceden de Scryfall y pertenecen a sus respectivos propietarios. Magic: The Gathering es una marca de Wizards of the Coast.',
      },
      navigation: {
        backToTop: 'Subir al inicio',
        previousSection: 'Sección anterior',
        nextSection: 'Sección siguiente',
      },
      errors: {
        missingName: 'Escribe un nombre antes de buscar.',
        notFound: 'No encontramos esa carta en Scryfall.',
        notFoundNamed: 'No hemos encontrado ninguna carta llamada «{name}».',
        searchFailed: 'No se pudo buscar la carta.',
        searchFailedNamed: 'No hemos podido buscar la carta «{name}».',
        inkSavingProcessing:
          'No se pudo preparar una imagen para ahorrar tinta.',
        parseLine: 'Carta {line}: {message}',
        close: 'Cerrar aviso',
        quickAddSingle: 'El añadido rápido solo admite una carta por vez.',
      },
    },
  },
})
