<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { ProxyPage } from '@/domain/proxy-sheet'
import BaseCard from './ui/BaseCard.vue'

defineProps<{
  pages: ProxyPage[]
}>()

const { t } = useI18n()
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
    <p class="print-note">
      {{ t('preview.note') }}
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
        {{ t('preview.empty') }}
      </p>
    </div>
  </BaseCard>
</template>
