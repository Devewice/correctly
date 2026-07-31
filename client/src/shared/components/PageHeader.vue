<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})

const { t } = useI18n()
</script>

<template>
  <div class="mb-6">
    <v-btn
      variant="text"
      color="primary"
      class="px-0 mb-2"
      prepend-icon="mdi-arrow-left"
      to="/dashboard"
    >
      {{ t('nav.dashboard') }}
    </v-btn>
    <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
    <p v-if="subtitle" class="text-body-2 text-medium-emphasis mt-1">{{ subtitle }}</p>
  </div>
</template>

