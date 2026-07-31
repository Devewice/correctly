<script setup>
import { useI18n } from 'vue-i18n'
import { usePwaInstall } from '@/shared/pwa/usePwaInstall'

const { t } = useI18n()
const { canPrompt, isApp, showIosHelp, promptInstall } = usePwaInstall()
</script>

<template>
  <v-card v-if="!isApp" class="pa-4 mb-4 install-card" variant="flat">
    <div class="d-flex align-start ga-3">
      <v-avatar color="primary" variant="flat" size="40">
        <v-icon icon="mdi-cellphone-arrow-down" />
      </v-avatar>
      <div class="flex-grow-1" style="min-width: 0">
        <div class="text-subtitle-2 font-weight-bold mb-1">{{ t('pwa.title') }}</div>
        <p class="text-caption mb-3 install-card__sub">{{ t('pwa.subtitle') }}</p>

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

  <v-alert v-else type="success" variant="tonal" density="compact" class="mb-4">
    {{ t('pwa.installed') }}
  </v-alert>
</template>

<style scoped>
.install-card {
  background: #f4cba8 !important;
  color: #3d3d3d !important;
  border: 1px solid rgba(94, 122, 91, 0.16) !important;
}
.install-card__sub {
  color: rgba(61, 61, 61, 0.78) !important;
  line-height: 1.35;
}
</style>
