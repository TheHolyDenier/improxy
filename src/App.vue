<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import CardListInput from './components/CardListInput.vue'
import CardRowEditor from './components/CardRowEditor.vue'
import LanguageControls from './components/LanguageControls.vue'
import ProxyPrintPreview from './components/ProxyPrintPreview.vue'
import ReadinessSummary from './components/ReadinessSummary.vue'
import ScrollToTopButton from './components/ScrollToTopButton.vue'
import BaseButton from './components/ui/BaseButton.vue'
import BaseCard from './components/ui/BaseCard.vue'
import BaseInput from './components/ui/BaseInput.vue'
import { useProxyWorkspace } from './composables/useProxyWorkspace'

const {
  rawList,
  parseErrors,
  isLoading,
  globalLanguage,
  inkSaving,
  rows,
  visibleRows,
  totalCopies,
  unresolvedCount,
  pages,
  readyToPrint,
  importList,
  updateRow,
  searchRow,
  addCardFromSyntax,
  removeRow,
  setGlobalLanguage,
  setRowLanguage,
  setInkSaving,
  print,
} = useProxyWorkspace()

const { t } = useI18n()
const quickAddValue = ref('')

async function addQuickCard() {
  const value = quickAddValue.value.trim()
  if (!value) {
    return
  }

  if (await addCardFromSyntax(value)) {
    quickAddValue.value = ''
  }
}
</script>

<template>
  <main class="app">
    <div class="app__import-language">
      <LanguageControls
        :model-value="globalLanguage"
        @update:model-value="setGlobalLanguage"
      />
    </div>
    <header class="hero">
      <div class="hero__copy">
        <h1 class="hero__title">
          {{ t('hero.title') }}
          <span class="hero__title-accent">{{ t('hero.titleAccent') }}</span>
        </h1>
      </div>
      <div class="hero__sticker">
        {{ t('hero.stickerLine1') }}<br />{{ t('hero.stickerLine2') }}
      </div>
    </header>

    <div id="import-section">
      <CardListInput
        v-model="rawList"
        :error-messages="parseErrors"
        :loading="isLoading"
        @import="importList"
      />
    </div>

    <section id="workspace-section" class="app__workspace">
      <BaseCard class="app__rows-card">
        <div class="app__section-heading">
          <div>
            <p class="app__eyebrow">{{ t('workspace.kicker') }}</p>
            <h2 class="app__section-title">{{ t('workspace.title') }}</h2>
          </div>
        </div>
        <div class="app__quick-add">
          <BaseInput
            v-model="quickAddValue"
            :label="t('import.quickAddLabel')"
            :placeholder="t('import.quickAddPlaceholder')"
            :disabled="isLoading"
            @keyup.enter="addQuickCard"
          />
          <BaseButton
            variant="secondary"
            :disabled="isLoading"
            @click="addQuickCard"
          >
            {{ isLoading ? t('import.loading') : t('import.quickAdd') }}
          </BaseButton>
        </div>
        <div v-if="!visibleRows.length" class="app__empty-state">
          {{ t('workspace.empty') }}
        </div>
        <div v-else class="app__rows-list">
          <div v-for="row in visibleRows" :key="row.id" class="app__row-group">
            <CardRowEditor
              :row="row"
              :language="row.languageOverride || globalLanguage"
              @update="updateRow(row.id, $event)"
              @remove="removeRow(row.id)"
              @language="setRowLanguage(row.id, $event)"
              @retry-language-search="
                searchRow(row, row.languageOverride || globalLanguage)
              "
            />
          </div>
        </div>
      </BaseCard>
      <ReadinessSummary
        :total-copies="totalCopies"
        :unresolved-count="unresolvedCount"
        :ready="readyToPrint"
        :loading="isLoading"
        @print="print"
      />
    </section>
    <div id="preview-section">
      <ProxyPrintPreview
        :pages="pages"
        :ink-saving="inkSaving"
        @update:ink-saving="setInkSaving"
      />
    </div>
    <ScrollToTopButton :enabled="rows.length > 3" />
  </main>
</template>

<style scoped>
.app {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 44px 0 80px;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.hero__title {
  max-width: 760px;
  margin: 8px 0 14px;
  color: var(--ink);
  font-size: clamp(3.2rem, 8vw, 7.5rem);
  font-weight: 900;
  letter-spacing: -0.09em;
  line-height: 0.85;
}

.hero__title-accent {
  display: block;
  color: var(--pink);
}

.hero__copy {
  max-width: 760px;
}

.hero__sticker {
  min-width: 145px;
  padding: 22px 14px;
  border: 3px solid var(--ink);
  border-radius: 50%;
  color: var(--ink);
  background: #ffd84d;
  box-shadow: 7px 7px 0 var(--ink);
  font-size: 0.78rem;
  font-weight: 900;
  line-height: 1.05;
  text-align: center;
  transform: rotate(8deg);
}

.app__eyebrow {
  margin: 0;
  color: var(--pink-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.app__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.8fr);
  gap: 18px;
  margin-top: 18px;
}

.app__import-language {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.app__section-subtitle {
  max-width: 680px;
  margin: 0;
  color: var(--muted);
}

.app__rows-card {
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.app__section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.app__section-title {
  margin: 0;
  color: var(--ink);
  font-size: 1.8rem;
  letter-spacing: -0.04em;
}

.app__empty-state {
  padding: 28px;
  border: 1px dashed var(--line);
  border-radius: 16px;
  color: var(--muted);
  text-align: center;
}

.app__rows-list {
  display: grid;
  gap: 14px;
}

.app__row-group {
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #f7eefa;
}

.app__row-group :deep(.row-editor) {
  border: 0;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
}

.app__row-group :deep(.result-card) {
  border-radius: 0;
}

.app__quick-add {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.app__quick-add .button {
  white-space: nowrap;
}

@media (max-width: 820px) {
  .hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero__sticker {
    align-self: flex-end;
  }

  .app__workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .app {
    width: min(100% - 20px, 1180px);
    padding-top: 24px;
  }

  .hero__title {
    font-size: 3.9rem;
  }
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  .app {
    width: auto;
    padding: 0;
  }

  .hero,
  :deep(.import-card),
  .app__workspace,
  :deep(.scroll-top-slot) {
    display: none;
  }

  :deep(.print-preview) {
    margin: 0;
  }
}
</style>
