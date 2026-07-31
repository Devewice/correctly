<script setup>
import { useI18n } from 'vue-i18n'
import { usePwaInstall } from '@/shared/pwa/usePwaInstall'

const { t } = useI18n()
const { canPrompt, isApp, showIosHelp, promptInstall } = usePwaInstall()
</script>

<template>
  <v-card v-if="!isApp" class="pa-5 mb-4" variant="tonal" color="secondary">
    <div class="d-flex align-start ga-3">
      <v-avatar color="primary" variant="flat" size="44">
        <v-icon icon="mdi-cellphone-arrow-down" />
      </v-avatar>
      <div class="flex-grow-1">
        <div class="text-subtitle-1 font-weight-bold mb-1">{{ t('pwa.title') }}</div>
        <p class="text-body-2 text-medium-emphasis mb-3">{{ t('pwa.subtitle') }}</p>

        <v-btn v-if="canPrompt" color="primary" @click="promptInstall">
          {{ t('pwa.install') }}
        </v-btn>

        <div v-else-if="showIosHelp" class="text-body-2">
          <ol class="ps-4 mb-0">
            <li>{{ t('pwa.ios1') }}</li>
            <li>{{ t('pwa.ios2') }}</li>
            <li>{{ t('pwa.ios3') }}</li>
          </ol>
        </div>

        <p v-else class="text-caption text-medium-emphasis mb-0">
          {{ t('pwa.manual') }}
        </p>
      </div>
    </div>
  </v-card>

  <v-alert v-else type="success" variant="tonal" density="comfortable" class="mb-4">
    {{ t('pwa.installed') }}
  </v-alert>
</template>
