<script setup lang="ts">
import BaseButton from './ui/BaseButton.vue'
import BaseCard from './ui/BaseCard.vue'

defineProps<{
  totalCopies: number
  unresolvedCount: number
  ready: boolean
}>()

const emit = defineEmits<{
  print: []
}>()
</script>

<template>
  <BaseCard class="readiness-card">
    <div>
      <p class="eyebrow">03 / LISTO PARA SALIR</p>
      <h2>{{ totalCopies }} proxies preparados</h2>
      <p v-if="unresolvedCount">
        Faltan {{ unresolvedCount }} fila(s) por resolver antes de imprimir.
      </p>
      <p v-else>Todo resuelto. Revisa el tamaño y dispara la impresión.</p>
    </div>
    <BaseButton :disabled="!ready" @click="emit('print')">
      Imprimir hojas
    </BaseButton>
  </BaseCard>
</template>
