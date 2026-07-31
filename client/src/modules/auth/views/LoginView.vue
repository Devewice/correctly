<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { setLocale } from '@/plugins/i18n'
import BrandLogo from '@/shared/components/BrandLogo.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t, locale } = useI18n()
const auth = useAuthStore()
const error = ref('')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const oauthError = params.get('error')
  if (oauthError === 'oauth_not_configured') {
    error.value = t('login.errors.notConfigured')
  } else if (oauthError === 'oauth_denied') {
    error.value = t('login.errors.denied')
  } else if (oauthError === 'oauth_no_email') {
    error.value = t('login.errors.noEmail')
  } else if (oauthError === 'oauth_db') {
    error.value = t('login.errors.db')
  } else if (oauthError === 'oauth_retry') {
    error.value = t('login.errors.retry')
  } else if (oauthError === 'oauth_network') {
    error.value = t('login.errors.network')
  } else if (oauthError === 'oauth_failed') {
    error.value = t('login.errors.failed')
  }
  if (oauthError) {
    params.delete('error')
    const qs = params.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }
  try {
    await auth.fetchStatus()
  } catch {
    error.value = t('login.errors.serverDown')
  }
})

function googleLogin() {
  if (auth.authStatus.statusError) {
    error.value = t('login.errors.serverDown')
    // Igual intentamos: a veces el OAuth responde aunque /status falle
  } else if (auth.authStatus.googleConfigured === false) {
    error.value = t('login.googleUnavailable')
    return
  }
  const redirect = new URLSearchParams(window.location.search).get('redirect')
  if (redirect) sessionStorage.setItem('correctly_redirect', redirect)
  window.location.href = '/api/auth/google'
}
</script>

<template>
  <v-card class="login-card cx-card-shell pa-5 pa-sm-8 text-center" elevation="0">
    <div
      v-motion
      v-bind="withDelay(fadeUp, 80)"
      class="d-flex justify-center mb-6"
    >
      <BrandLogo :size="64" stacked>
        <template #tagline>
          <div class="login-tagline">{{ t('app.tagline') }}</div>
        </template>
      </BrandLogo>
    </div>

    <div v-motion v-bind="withDelay(fadeUp, 180)">
      <h1 class="text-h5 font-weight-bold mb-2">{{ t('login.title') }}</h1>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('login.subtitle') }}</p>
    </div>

    <div v-motion v-bind="withDelay(fadeUp, 280)" class="d-flex justify-center ga-2 mb-8">
      <button
        v-for="(lang, i) in ['es', 'en', 'pt']"
        :key="lang"
        v-motion
        v-bind="{
          ...softHover,
          ...withDelay(fadeUp, 320 + i * 70),
        }"
        type="button"
        class="select-tile"
        :class="{ 'select-tile--on': locale === lang }"
        style="width: auto; min-width: 3.5rem"
        @click="setLocale(lang)"
      >
        {{ lang }}
      </button>
    </div>

    <div
      v-motion
      v-bind="{
        ...softHover,
        ...withDelay(fadeUp, 420),
      }"
    >
      <v-btn
        block
        color="primary"
        size="x-large"
        :disabled="auth.authStatus.googleConfigured === false && auth.authStatus.statusLoaded"
        @click="googleLogin"
      >
        <v-icon start icon="mdi-google" />
        {{ t('login.google') }}
      </v-btn>
    </div>

    <p
      v-if="auth.authStatus.googleConfigured === false && !auth.authStatus.statusError"
      v-motion
      v-bind="withDelay(fadeUp, 500)"
      class="text-caption text-medium-emphasis mt-4"
    >
      {{ t('login.googleUnavailable') }}
    </p>
    <p
      v-else-if="auth.authStatus.statusError"
      v-motion
      v-bind="withDelay(fadeUp, 500)"
      class="text-caption text-medium-emphasis mt-4"
    >
      {{ t('login.errors.serverDown') }}
    </p>

    <v-alert
      v-if="error"
      v-motion
      v-bind="fadeUp"
      type="error"
      class="mt-4 text-left"
      density="compact"
    >
      {{ error }}
    </v-alert>
  </v-card>
</template>

<style scoped>
.login-card {
  backdrop-filter: blur(18px);
  background: color-mix(in srgb, var(--cx-surface) 90%, transparent) !important;
  border: none !important;
  box-shadow: var(--cx-shadow-lift) !important;
}

.login-tagline {
  font-size: 0.85rem;
  color: var(--cx-text-soft);
  margin-top: 2px;
  max-width: 260px;
  line-height: 1.35;
}
</style>
