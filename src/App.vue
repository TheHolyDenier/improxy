<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import CardListInput from './components/CardListInput.vue'
import CardResultCard from './components/CardResultCard.vue'
import CardRowEditor from './components/CardRowEditor.vue'
import LanguageControls from './components/LanguageControls.vue'
import ProxyPrintPreview from './components/ProxyPrintPreview.vue'
import ReadinessSummary from './components/ReadinessSummary.vue'
import ScrollToTopButton from './components/ScrollToTopButton.vue'
import BaseButton from './components/ui/BaseButton.vue'
import BaseCard from './components/ui/BaseCard.vue'
import { useProxyWorkspace } from './composables/useProxyWorkspace'

const {
  rawList,
  parseErrors,
  globalLanguage,
  inkSaving,
  rows,
  totalCopies,
  unresolvedCount,
  pages,
  readyToPrint,
  importList,
  searchRow,
  updateRow,
  addRow,
  removeRow,
  duplicateRow,
  setGlobalLanguage,
  setRowLanguage,
  setInkSaving,
  print,
} = useProxyWorkspace()

const { t } = useI18n()
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <div class="hero__copy">
        <p class="eyebrow">{{ t('hero.kicker') }}</p>
        <h1>
          {{ t('hero.title') }}
          <span>{{ t('hero.titleAccent') }}</span>
        </h1>
        <p class="hero__lead">{{ t('hero.lead') }}</p>
      </div>
      <div class="hero__sticker">
        {{ t('hero.stickerLine1') }}<br />{{ t('hero.stickerLine2') }}
      </div>
    </header>

    <CardListInput
      v-model="rawList"
      :error-messages="parseErrors"
      @import="importList"
    />

    <section class="workspace-grid">
      <BaseCard class="rows-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">{{ t('workspace.kicker') }}</p>
            <h2>{{ t('workspace.title') }}</h2>
          </div>
          <LanguageControls
            :model-value="globalLanguage"
            @update:model-value="setGlobalLanguage"
          />
        </div>
        <div v-if="!rows.length" class="empty-state">
          {{ t('workspace.empty') }}
        </div>
        <div v-else class="rows-list">
          <div v-for="row in rows" :key="row.id" class="row-group">
            <CardRowEditor
              :row="row"
              @update="updateRow(row.id, $event)"
              @remove="removeRow(row.id)"
              @duplicate="duplicateRow(row.id)"
              @search="searchRow(row)"
            />
            <CardResultCard
              v-if="row.printings.length"
              :printings="row.printings"
              :selected-printing-id="row.selectedPrintingId"
              :language="row.languageOverride || globalLanguage"
              @update:selected-printing-id="
                updateRow(row.id, { selectedPrintingId: $event })
              "
              @update:language="setRowLanguage(row.id, $event)"
            />
          </div>
        </div>
        <BaseButton variant="secondary" @click="addRow">
          {{ t('workspace.add') }}
        </BaseButton>
      </BaseCard>

      <ReadinessSummary
        :total-copies="totalCopies"
        :unresolved-count="unresolvedCount"
        :ready="readyToPrint"
        @print="print"
      />
    </section>

    <ProxyPrintPreview
      :pages="pages"
      :ink-saving="inkSaving"
      @update:ink-saving="setInkSaving"
    />
    <ScrollToTopButton />
  </main>
</template>
