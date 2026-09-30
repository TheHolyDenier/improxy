<script setup lang="ts">
import type { ScryfallPrinting } from '@/domain/card'
import BaseSelect from './ui/BaseSelect.vue'

const props = defineProps<{
  printings: ScryfallPrinting[]
  selectedPrintingId: string
  language: string
}>()

const emit = defineEmits<{
  'update:selectedPrintingId': [value: string]
  'update:language': [value: string]
}>()

const languageOptions = [
  { value: 'en', label: 'Inglés' },
  { value: 'es', label: 'Español' },
  { value: 'ja', label: 'Japonés' },
  { value: 'de', label: 'Alemán' },
  { value: 'fr', label: 'Francés' },
]

const selectedPrinting = () =>
  props.printings.find((printing) => printing.id === props.selectedPrintingId)
</script>

<template>
  <div v-if="selectedPrinting()" class="result-card">
    <img :src="selectedPrinting()?.imageUri" :alt="selectedPrinting()?.name" />
    <div class="result-card__details">
      <p class="eyebrow">EDICIÓN SELECCIONADA</p>
      <h3>{{ selectedPrinting()?.setName }}</h3>
      <p>
        {{ selectedPrinting()?.setCode.toUpperCase() }} ·
        {{ selectedPrinting()?.collectorNumber }}
      </p>
      <BaseSelect
        :model-value="selectedPrintingId"
        label="Edición de la carta"
        :options="
          printings.map((printing) => ({
            value: printing.id,
            label: `${printing.setName} · ${printing.collectorNumber}`,
          }))
        "
        @update:model-value="emit('update:selectedPrintingId', $event)"
      />
      <BaseSelect
        :model-value="language"
        label="Idioma de la carta"
        :options="languageOptions"
        @update:model-value="emit('update:language', $event)"
      />
    </div>
  </div>
  <div v-else class="empty-result">
    <p>Sin impresión seleccionada.</p>
  </div>
</template>
