<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  backTo: { type: String, default: '/dashboard' },
  showBack: { type: Boolean, default: true },
})

const { t } = useI18n()
</script>

<template>
  <header class="cx-page-header">
    <v-btn
      v-if="showBack"
      variant="text"
      color="primary"
      class="cx-page-header__back"
      prepend-icon="mdi-arrow-left"
      :to="backTo"
      size="small"
      density="comfortable"
    >
      {{ t('nav.dashboard') }}
    </v-btn>
    <div class="cx-page-header__row">
      <div v-if="icon" class="cx-page-header__icon" aria-hidden="true">
        <v-icon :icon="icon" color="primary" size="26" />
      </div>
      <div class="cx-page-header__text">
        <h1 class="cx-page-title">{{ title }}</h1>
        <p v-if="subtitle" class="cx-page-sub">{{ subtitle }}</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.cx-page-header {
  margin-bottom: 1.2rem;
}
.cx-page-header__back {
  margin: 0 0 0.35rem -0.45rem;
  min-height: 34px !important;
  font-weight: 600;
  opacity: 0.9;
}
.cx-page-header__row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}
.cx-page-header__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--cx-primary-soft);
}
.cx-page-header__text {
  min-width: 0;
}
</style>
