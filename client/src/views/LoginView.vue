<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { setLocale } from '@/i18n'

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

function changeLang(lang) {
  setLocale(lang)
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center px-4 py-10">
    <div
      v-motion
      :initial="{ opacity: 0, y: 24 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
      class="w-full max-w-md overflow-hidden rounded-[2rem] bg-white/80 p-8 shadow-[0_20px_60px_-30px_rgba(94,122,91,0.55)] ring-1 ring-black/5 backdrop-blur"
    >
      <div class="mb-8 text-center">
        <p class="font-display text-4xl font-800 text-sage-dark">{{ t('app.name') }}</p>
        <p class="mt-2 text-muted">{{ t('app.tagline') }}</p>
        <h1 class="mt-6 font-display text-2xl font-700 text-ink">{{ t('login.title') }}</h1>
        <p class="mt-2 text-sm text-muted">{{ t('login.subtitle') }}</p>
      </div>

      <div class="mb-6 flex justify-center gap-2">
        <button
          v-for="lang in ['es', 'en', 'pt']"
          :key="lang"
          type="button"
          class="rounded-full px-3 py-1 text-xs uppercase tracking-wide"
          :class="locale === lang ? 'bg-sage text-white' : 'bg-sand text-muted'"
          @click="changeLang(lang)"
        >
          {{ lang }}
        </button>
      </div>

      <div class="space-y-3">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          :disabled="!auth.authStatus.googleConfigured"
          @click="googleLogin"
        >
          {{ t('login.google') }}
        </button>

        <p
          v-if="!auth.authStatus.googleConfigured"
          class="text-center text-xs text-muted"
        >
          {{ t('login.googleUnavailable') }}
        </p>

        <button
          v-if="auth.authStatus.devLogin"
          type="button"
          class="w-full rounded-2xl bg-sage px-4 py-3 text-sm font-medium text-white transition hover:bg-sage-dark disabled:opacity-50"
          :disabled="busy"
          @click="demoLogin"
        >
          {{ busy ? t('common.loading') : t('login.dev') }}
        </button>

        <button
          v-if="auth.authStatus.devLogin"
          type="button"
          class="w-full rounded-2xl bg-lavender/80 px-4 py-3 text-sm font-medium text-ink ring-1 ring-lavender disabled:opacity-50"
          :disabled="busy"
          @click="adminLogin"
        >
          {{ t('login.devAdmin') }}
        </button>
      </div>

      <p v-if="error" class="mt-4 text-center text-sm text-danger">{{ error }}</p>
    </div>
  </div>
</template>
