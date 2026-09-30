<template>
  <section class="card">
    <slot />
  </section>
</template>

<style scoped>
.card {
  padding: 24px;
  border: 1px solid rgba(42, 20, 37, 0.1);
  border-radius: 24px;
  background: rgba(255, 250, 247, 0.82);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px);
}
</style>
