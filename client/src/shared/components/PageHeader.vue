<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /** Ruta de vuelta; por defecto Hoy */
  backTo: { type: String, default: '/dashboard' },
  showBack: { type: Boolean, default: true },
})

const { t } = useI18n()
</script>

<template>
  <header class="cx-page-header mb-5">
    <v-btn
      v-if="showBack"
      variant="text"
      color="primary"
      class="px-0 mb-2"
      prepend-icon="mdi-arrow-left"
      :to="backTo"
    >
      {{ t('nav.dashboard') }}
    </v-btn>
    <h1 class="cx-page-title">{{ title }}</h1>
    <p v-if="subtitle" class="cx-page-sub">{{ subtitle }}</p>
  </header>
</template>
