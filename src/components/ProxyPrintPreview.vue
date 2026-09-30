<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ProxyPage } from '@/domain/proxy-sheet'
import { createInkSavingImageUri } from '@/services/ink-saving-image'
import BaseCard from './ui/BaseCard.vue'

const props = withDefaults(
  defineProps<{
    pages: ProxyPage[]
    inkSaving?: boolean
  }>(),
  {
    inkSaving: false,
  },
)

const emit = defineEmits<{
  'update:inkSaving': [value: boolean]
}>()

const { t } = useI18n()
const processedImages = ref(new Map<string, string>())
const failedImages = ref(new Set<string>())
const processingImages = new Map<string, Promise<void>>()
const imageUris = computed(() =>
  Array.from(
    new Set(
      props.pages.flatMap((page) =>
        page.copies.map((copy) => copy.printing.imageUri),
      ),
    ),
  ),
)

function getPrintableImageUri(imageUri: string) {
  if (!props.inkSaving) {
    return imageUri
  }

  return processedImages.value.get(imageUri) ?? imageUri
}

function isProcessedImage(imageUri: string) {
  return props.inkSaving && processedImages.value.has(imageUri)
}

function processImage(imageUri: string) {
  if (
    processedImages.value.has(imageUri) ||
    failedImages.value.has(imageUri) ||
    processingImages.has(imageUri)
  ) {
    return
  }

  const request = createInkSavingImageUri(imageUri)
    .then((processedUri) => {
      processedImages.value = new Map(processedImages.value).set(
        imageUri,
        processedUri,
      )
    })
    .catch((error: unknown) => {
      failedImages.value = new Set(failedImages.value).add(imageUri)
      globalThis.console.error(
        'No se pudo procesar la imagen para ahorrar tinta.',
        error,
      )
    })
    .finally(() => {
      processingImages.delete(imageUri)
    })

  processingImages.set(imageUri, request)
}

watch(
  [() => props.inkSaving, imageUris],
  ([enabled, uris]) => {
    if (!enabled) {
      return
    }

    uris.forEach(processImage)
  },
  { immediate: true },
)

function updateInkSaving(event: { target: unknown }) {
  if (
    typeof event.target !== 'object' ||
    event.target === null ||
    !('checked' in event.target) ||
    typeof event.target.checked !== 'boolean'
  ) {
    return
  }

  emit('update:inkSaving', event.target.checked)
}
</script>

<template>
  <BaseCard class="preview-card">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ t('preview.kicker') }}</p>
        <h2>{{ t('preview.title') }}</h2>
      </div>
      <span class="section-badge">{{ t('preview.size') }}</span>
    </div>
    <div class="print-controls">
      <p class="print-note">
        {{ t('preview.note') }}
      </p>
      <label class="ink-saving-control">
        <input
          type="checkbox"
          :checked="props.inkSaving"
          :aria-label="t('preview.inkSaving')"
          @change="updateInkSaving"
        />
        <span>
          <strong>{{ t('preview.inkSaving') }}</strong>
          <small>{{ t('preview.inkSavingHelp') }}</small>
        </span>
      </label>
    </div>
    <div
      class="print-pages"
      :class="{ 'print-pages--ink-saving': props.inkSaving }"
    >
      <div
        v-for="(page, pageIndex) in pages"
        :key="pageIndex"
        class="print-page"
      >
        <div
          v-for="slot in 9"
          :key="slot"
          class="print-slot"
          :class="{ 'print-slot--empty': !page.copies[slot - 1] }"
        >
          <template v-if="page.copies[slot - 1]">
            <img
              class="print-slot__image"
              :class="{
                'print-slot__image--fallback': !isProcessedImage(
                  page.copies[slot - 1]?.printing.imageUri ?? '',
                ),
              }"
              :src="
                getPrintableImageUri(
                  page.copies[slot - 1]?.printing.imageUri ?? '',
                )
              "
              :alt="page.copies[slot - 1]?.printing.name"
            />
          </template>
        </div>
      </div>
      <p v-if="!pages.length" class="empty-preview">
        {{ t('preview.empty') }}
      </p>
    </div>
  </BaseCard>
</template>
