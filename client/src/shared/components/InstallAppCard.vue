<script setup>
import { useI18n } from 'vue-i18n'
import { usePwaInstall } from '@/shared/pwa/usePwaInstall'

defineProps({
  /** Versión baja para el menú Más / espacios estrechos */
  compact: { type: Boolean, default: false },
})

const { t } = useI18n()
const { canPrompt, isApp, showIosHelp, promptInstall } = usePwaInstall()
</script>

<template>
  <v-card
    v-if="!isApp"
    class="install-card mb-4"
    :class="compact ? 'install-card--compact pa-3' : 'pa-4'"
    variant="flat"
  >
    <div class="d-flex align-start ga-3">
      <v-avatar
        color="primary"
        variant="flat"
        :size="compact ? 36 : 40"
        class="flex-shrink-0"
      >
        <v-icon icon="mdi-cellphone-arrow-down" :size="compact ? 20 : 24" />
      </v-avatar>
      <div class="install-card__body">
        <div class="text-subtitle-2 font-weight-bold install-card__title">
          {{ t('pwa.title') }}
        </div>
        <p class="text-caption mb-2 install-card__sub">
          {{ compact ? t('pwa.subtitleShort') : t('pwa.subtitle') }}
        </p>

        <v-btn
          v-if="canPrompt"
          color="primary"
          :size="compact ? 'small' : 'default'"
          class="install-card__btn"
          @click="promptInstall"
        >
          {{ t('pwa.install') }}
        </v-btn>

        <ol v-else-if="showIosHelp" class="text-caption ps-4 mb-0 install-card__list">
          <li>{{ t('pwa.ios1') }}</li>
          <li>{{ t('pwa.ios2') }}</li>
          <li>{{ t('pwa.ios3') }}</li>
        </ol>

        <p v-else class="text-caption mb-0 install-card__sub">
          {{ compact ? t('pwa.manualShort') : t('pwa.manual') }}
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
  overflow: visible !important;
  width: 100%;
}
.install-card__body {
  flex: 1 1 auto;
  min-width: 0;
  overflow: visible;
}
.install-card__title {
  color: #3d3d3d !important;
  line-height: 1.25;
  word-break: break-word;
}
.install-card__sub {
  color: rgba(61, 61, 61, 0.8) !important;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}
.install-card__list {
  color: rgba(61, 61, 61, 0.85);
  line-height: 1.4;
}
.install-card__btn {
  white-space: normal !important;
  height: auto !important;
  min-height: 36px;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
.install-card--compact .install-card__sub {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
