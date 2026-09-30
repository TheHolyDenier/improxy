<script setup lang="ts">
import CardListInput from './components/CardListInput.vue'
import CardResultCard from './components/CardResultCard.vue'
import CardRowEditor from './components/CardRowEditor.vue'
import LanguageControls from './components/LanguageControls.vue'
import ProxyPrintPreview from './components/ProxyPrintPreview.vue'
import ReadinessSummary from './components/ReadinessSummary.vue'
import BaseButton from './components/ui/BaseButton.vue'
import BaseCard from './components/ui/BaseCard.vue'
import { useProxyWorkspace } from './composables/useProxyWorkspace'

const {
  rawList,
  parseErrors,
  globalLanguage,
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
  print,
} = useProxyWorkspace()
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <div class="hero__copy">
        <p class="eyebrow">MTG PROXY PRINTER / 01</p>
        <h1>
          Cartas listas.
          <span>Caos controlado.</span>
        </h1>
        <p class="hero__lead">
          Convierte una lista en proxies imprimibles a tamaño real. Sin
          middleware raro, sin rehacerlo todo por una carta.
        </p>
      </div>
      <div class="hero__sticker">MAKE IT<br />PRINTABLE</div>
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
            <p class="eyebrow">02 / AJUSTA SIN MIEDO</p>
            <h2>Tu lista, en filas</h2>
          </div>
          <LanguageControls
            :model-value="globalLanguage"
            @update:model-value="setGlobalLanguage"
          />
        </div>
        <div v-if="!rows.length" class="empty-state">
          Importa una lista o añade una fila para empezar.
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
          + Añadir carta
        </BaseButton>
      </BaseCard>

      <ReadinessSummary
        :total-copies="totalCopies"
        :unresolved-count="unresolvedCount"
        :ready="readyToPrint"
        @print="print"
      />
    </section>

    <ProxyPrintPreview :pages="pages" />
  </main>
</template>
