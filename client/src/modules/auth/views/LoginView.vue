<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { setLocale } from '@/plugins/i18n'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const busy = ref(false)
const error = ref('')

onMounted(() => {
  auth.fetchStatus()
})

async function demoLogin() {
  busy.value = true
  error.value = ''
  try {
    const user = await auth.devLogin({ language: locale.value })
    router.push(user.onboardingCompleted ? '/dashboard' : '/onboarding')
  } catch (e) {
    error.value = e.message || t('common.error')
  } finally {
    busy.value = false
  }
}

async function adminLogin() {
  busy.value = true
  error.value = ''
  try {
    await auth.devLoginAdmin({ language: locale.value })
    router.push('/admin')
  } catch (e) {
    error.value = e.message || t('common.error')
  } finally {
    busy.value = false
  }
}

function googleLogin() {
  window.location.href = '/api/auth/google'
}
</script>

<template>
  <v-card class="pa-6 pa-sm-8" border>
    <div class="text-center mb-6">
      <div class="text-h4 font-weight-bold text-primary-darken-1">
        {{ t('app.name') }}
      </div>
      <div class="text-body-2 text-medium-emphasis mt-1">{{ t('app.tagline') }}</div>
      <div class="text-h6 mt-5">{{ t('login.title') }}</div>
      <div class="text-body-2 text-medium-emphasis">{{ t('login.subtitle') }}</div>
    </div>

    <div class="d-flex justify-center ga-2 mb-6">
      <v-chip
        v-for="lang in ['es', 'en', 'pt']"
        :key="lang"
        :color="locale === lang ? 'primary' : undefined"
        :variant="locale === lang ? 'flat' : 'tonal'"
        size="small"
        label
        @click="setLocale(lang)"
      >
        {{ lang }}
      </v-chip>
    </div>

    <v-btn
      block
      color="on-surface"
      class="mb-3"
      size="large"
      :disabled="!auth.authStatus.googleConfigured"
      @click="googleLogin"
    >
      <v-icon start icon="mdi-google" />
      {{ t('login.google') }}
    </v-btn>

    <p
      v-if="!auth.authStatus.googleConfigured"
      class="text-caption text-medium-emphasis text-center mb-4"
    >
      {{ t('login.googleUnavailable') }}
    </p>

    <v-btn
      v-if="auth.authStatus.devLogin"
      block
      color="primary"
      size="large"
      class="mb-3"
      :loading="busy"
      @click="demoLogin"
    >
      {{ t('login.dev') }}
    </v-btn>

    <v-btn
      v-if="auth.authStatus.devLogin"
      block
      color="accent"
      size="large"
      variant="flat"
      :loading="busy"
      @click="adminLogin"
    >
      {{ t('login.devAdmin') }}
    </v-btn>

    <v-alert v-if="error" type="error" variant="tonal" class="mt-4" density="compact">
      {{ error }}
    </v-alert>
  </v-card>
</template>
