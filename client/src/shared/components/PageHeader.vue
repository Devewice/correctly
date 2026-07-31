<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
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
    <h1 class="cx-page-title">{{ title }}</h1>
    <p v-if="subtitle" class="cx-page-sub">{{ subtitle }}</p>
  </header>
</template>

<style scoped>
.cx-page-header {
  margin-bottom: 1.2rem;
}
.cx-page-header__back {
  margin: 0 0 0.2rem -0.45rem;
  min-height: 34px !important;
  font-weight: 600;
  opacity: 0.9;
}
</style>
