<script setup lang="ts">
import type { ProxyPage } from '@/domain/proxy-sheet'
import BaseCard from './ui/BaseCard.vue'

defineProps<{
  pages: ProxyPage[]
}>()
</script>

<template>
  <BaseCard class="preview-card">
    <div class="section-heading">
      <div>
        <p class="eyebrow">04 / VISTA DE IMPRESIÓN</p>
        <h2>Tu hoja, a tamaño real</h2>
      </div>
      <span class="section-badge">63 × 88 MM</span>
    </div>
    <p class="print-note">
      Imprime al 100 % y desactiva cualquier ajuste automático de escala.
    </p>
    <div class="print-pages">
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
          <img
            v-if="page.copies[slot - 1]"
            :src="page.copies[slot - 1]?.printing.imageUri"
            :alt="page.copies[slot - 1]?.printing.name"
          />
        </div>
      </div>
      <p v-if="!pages.length" class="empty-preview">
        Resuelve alguna carta para ver la cuadrícula 3x3.
      </p>
    </div>
  </BaseCard>
</template>
