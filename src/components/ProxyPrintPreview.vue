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
const processingImages = new Set<string>()
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

async function processImage(imageUri: string) {
  if (
    processedImages.value.has(imageUri) ||
    failedImages.value.has(imageUri) ||
    processingImages.has(imageUri)
  ) {
    return
  }

  processingImages.add(imageUri)
  try {
    const processedUri = await createInkSavingImageUri(imageUri)
    processedImages.value = new Map(processedImages.value).set(
      imageUri,
      processedUri,
    )
  } catch (error: unknown) {
    failedImages.value = new Set(failedImages.value).add(imageUri)
    globalThis.console.error(t('errors.inkSavingProcessing'), error)
  } finally {
    processingImages.delete(imageUri)
  }
}

watch(
  [() => props.inkSaving, imageUris],
  ([enabled, uris]) => {
    if (!enabled) {
      return
    }

    uris.forEach((uri) => {
      void processImage(uri)
    })
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
  <BaseCard class="print-preview">
    <div class="print-preview__heading">
      <div>
        <p class="print-preview__eyebrow">{{ t('preview.subtitle') }}</p>
        <h2 class="print-preview__title">{{ t('preview.title') }}</h2>
      </div>
      <span class="print-preview__badge">{{ t('preview.size') }}</span>
    </div>
    <div class="print-preview__controls">
      <label class="print-preview__ink-control">
        <input
          class="print-preview__ink-checkbox"
          type="checkbox"
          :checked="props.inkSaving"
          :aria-label="t('preview.inkSaving')"
          @change="updateInkSaving"
        />
        <span class="print-preview__ink-copy">
          <strong>{{ t('preview.inkSaving') }}</strong>
        </span>
      </label>
    </div>
    <div
      class="print-preview__pages"
      :class="{ 'print-preview__pages--ink-saving': props.inkSaving }"
    >
      <div
        v-for="(page, pageIndex) in pages"
        :key="pageIndex"
        class="print-preview__page"
      >
        <div
          v-for="slot in 9"
          :key="slot"
          class="print-preview__slot"
          :class="{
            'print-preview__slot--empty': !page.copies[slot - 1],
          }"
        >
          <template v-if="page.copies[slot - 1]">
            <img
              class="print-preview__image"
              :class="{
                'print-preview__image--fallback': !isProcessedImage(
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
      <p v-if="!pages.length" class="print-preview__empty">
        {{ t('preview.empty') }}
      </p>
    </div>
    <p class="print-preview__disclaimer">{{ t('preview.disclaimer') }}</p>
  </BaseCard>
</template>

<style scoped>
.print-preview {
  margin-top: 18px;
}

.print-preview__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.print-preview__eyebrow {
  margin: 0;
  color: var(--pink-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.print-preview__title {
  margin: 0;
  color: var(--ink);
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}

.print-preview__subtitle {
  margin: 4px 0 0;
  color: var(--muted);
}

.print-preview__badge {
  padding: 7px 10px;
  border-radius: 999px;
  color: #fff;
  background: var(--lilac);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.print-preview__controls {
  display: grid;
  gap: 14px;
}

.print-preview__note {
  margin: 0;
  color: var(--muted);
}

.print-preview__ink-control {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: min(100%, 620px);
  padding: 0 0 14px;
  cursor: pointer;
}

.print-preview__ink-checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--pink);
}

.print-preview__ink-copy {
  display: grid;
  gap: 2px;
}

.print-preview__ink-help {
  color: var(--muted);
  font-size: 0.78rem;
}

.print-preview__pages {
  display: grid;
  gap: 26px;
  overflow-x: auto;
}

.print-preview__page {
  display: grid;
  grid-template-columns: repeat(3, 63mm);
  grid-template-rows: repeat(3, 88mm);
  width: max-content;
  min-height: 264mm;
  padding: 8mm;
  gap: 2mm;
  background: #fff;
  box-shadow: 0 10px 30px rgba(42, 20, 37, 0.12);
}

.print-preview__slot {
  position: relative;
  width: 63mm;
  height: 88mm;
  overflow: hidden;
  border: 1px dashed rgba(42, 20, 37, 0.16);
  border-radius: 2mm;
  background: #fff;
}

.print-preview__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.print-preview__pages--ink-saving .print-preview__image--fallback {
  filter: grayscale(1) contrast(1.35) brightness(1.25);
}

.print-preview__slot--empty {
  background: #fffaf7;
}

.print-preview__empty {
  padding: 28px;
  border: 1px dashed var(--line);
  border-radius: 16px;
  color: var(--muted);
  text-align: center;
}

.print-preview__disclaimer {
  max-width: 820px;
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 0.7rem;
  line-height: 1.45;
}

@media print {
  .print-preview {
    margin: 0;
    padding: 0;
    border: 0;
    box-shadow: none;
  }

  .print-preview__heading,
  .print-preview__controls {
    display: none;
  }

  .print-preview__pages {
    display: block;
  }

  .print-preview__page {
    box-sizing: border-box;
    width: 210mm;
    height: 278mm;
    min-height: 0;
    padding: 5mm 8.5mm;
    break-after: auto;
    break-inside: avoid;
    margin: 0;
    box-shadow: none;
  }

  .print-preview__page > .print-preview__slot:nth-child(-n + 3) {
    border-top: 0;
  }

  .print-preview__page + .print-preview__page {
    break-before: page;
  }
}
</style>
