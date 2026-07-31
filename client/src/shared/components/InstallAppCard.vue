<script setup>
import { useI18n } from 'vue-i18n'
import { usePwaInstall } from '@/shared/pwa/usePwaInstall'

defineProps({
  compact: { type: Boolean, default: false },
})

const { t } = useI18n()
const { canPrompt, isApp, showIosHelp, promptInstall } = usePwaInstall()
</script>

<template>
  <v-card
    v-if="!isApp"
    class="install-card mb-3"
    :class="compact ? 'install-card--compact pa-3' : 'pa-4'"
    variant="flat"
  >
    <div class="d-flex align-start ga-3">
      <v-avatar
        color="secondary"
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

  <v-card
    v-else
    class="install-card install-card--done mb-3"
    :class="compact ? 'pa-3' : 'pa-4'"
    variant="flat"
  >
    <div class="d-flex align-center ga-3">
      <v-avatar
        color="success"
        variant="flat"
        :size="compact ? 36 : 40"
        class="flex-shrink-0"
      >
        <v-icon icon="mdi-check" color="white" :size="compact ? 20 : 22" />
      </v-avatar>
      <div class="install-card__body">
        <div class="text-subtitle-2 font-weight-bold install-card__title">
          {{ compact ? t('pwa.installedShort') : t('pwa.installed') }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.install-card {
  background: var(--cx-secondary-soft) !important;
  color: var(--cx-text) !important;
  border: 1px solid var(--cx-border) !important;
  border-radius: var(--cx-radius) !important;
  width: 100%;
}
.install-card--done {
  background: var(--cx-success-soft) !important;
  border-color: color-mix(in srgb, var(--cx-success) 35%, transparent) !important;
}
.install-card__body {
  flex: 1 1 auto;
  min-width: 0;
}
.install-card__title {
  color: var(--cx-text) !important;
  line-height: 1.3;
  word-break: break-word;
}
.install-card__sub,
.install-card__list {
  color: var(--cx-text-soft) !important;
  line-height: 1.4;
}
.install-card__btn {
  white-space: normal !important;
  height: auto !important;
  min-height: 36px;
}
.install-card--compact .install-card__sub {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
