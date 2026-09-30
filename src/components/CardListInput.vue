<script setup lang="ts">
import BaseButton from './ui/BaseButton.vue'
import BaseCard from './ui/BaseCard.vue'
import BaseTextarea from './ui/BaseTextarea.vue'

defineProps<{
  modelValue: string
  errorMessages: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  import: []
}>()
</script>

<template>
  <BaseCard class="import-card">
    <div class="section-heading">
      <div>
        <p class="eyebrow">01 / CARGA RÁPIDA</p>
        <h2>Pega tu lista</h2>
      </div>
      <span class="section-badge">NOMBRE = 1</span>
    </div>
    <p class="section-copy">
      Una carta por línea. El nombre es suficiente: la cantidad empieza en 1.
      También puedes usar <code>2 Lightning Bolt (STA)</code>.
    </p>
    <BaseTextarea
      :model-value="modelValue"
      label="Lista de cartas"
      placeholder="Lightning Bolt&#10;2 Counterspell (STA)&#10;Sheoldred, the Apocalypse"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="card-actions">
      <span v-if="errorMessages.length" class="inline-error">
        {{ errorMessages.join(' · ') }}
      </span>
      <BaseButton @click="emit('import')">Convertir en filas</BaseButton>
    </div>
  </BaseCard>
</template>
