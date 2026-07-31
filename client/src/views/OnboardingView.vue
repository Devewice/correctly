<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const step = ref(0)
const busy = ref(false)

const form = reactive({
  language: locale.value,
  activeModules: ['meals', 'water', 'mood', 'sleep', 'habits'],
  wakeTime: '07:00',
  sleepTime: '23:00',
  mainGoal: '',
  habits: [
    { name: 'Vitaminas', icon: '💊' },
    { name: 'Leer 15 min', icon: '📖' },
    { name: 'Estiramiento', icon: '🧘' },
  ],
})

const moduleKeys = ['meals', 'water', 'mood', 'sleep', 'habits', 'activity', 'journal', 'meditation']

function toggleModule(key) {
  const i = form.activeModules.indexOf(key)
  if (i >= 0) form.activeModules.splice(i, 1)
  else form.activeModules.push(key)
}

async function finish() {
  busy.value = true
  try {
    setLocale(form.language)
    const data = await api('/user/onboarding', {
      method: 'PUT',
      body: {
        language: form.language,
        activeModules: form.activeModules,
        wakeTime: form.wakeTime,
        sleepTime: form.sleepTime,
        mainGoal: form.mainGoal || undefined,
        habits: form.activeModules.includes('habits') ? form.habits : [],
      },
    })
    auth.user = data.user
    router.push('/dashboard')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
    <div
      v-motion
      :initial="{ opacity: 0, y: 16 }"
      :enter="{ opacity: 1, y: 0 }"
      class="rounded-[2rem] bg-white/85 p-7 shadow-lg ring-1 ring-black/5"
    >
      <p class="font-display text-sm font-700 uppercase tracking-widest text-sage">Correctly</p>
      <h1 class="mt-2 font-display text-3xl font-800 text-ink">{{ t('onboarding.welcome') }}</h1>

      <div v-if="step === 0" class="mt-6 space-y-4">
        <p class="text-sm text-muted">{{ t('onboarding.language') }}</p>
        <div class="flex gap-2">
          <button
            v-for="lang in ['es', 'en', 'pt']"
            :key="lang"
            type="button"
            class="rounded-full px-4 py-2 text-sm uppercase"
            :class="form.language === lang ? 'bg-sage text-white' : 'bg-sand'"
            @click="form.language = lang; setLocale(lang)"
          >
            {{ lang }}
          </button>
        </div>
        <button type="button" class="mt-4 w-full rounded-2xl bg-sage py-3 text-white" @click="step = 1">
          {{ t('onboarding.continue') }}
        </button>
      </div>

      <div v-else-if="step === 1" class="mt-6 space-y-4">
        <p class="text-sm text-muted">{{ t('onboarding.modules') }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="key in moduleKeys"
            :key="key"
            type="button"
            class="rounded-2xl px-3 py-3 text-left text-sm ring-1"
            :class="
              form.activeModules.includes(key)
                ? 'bg-sage/15 ring-sage text-sage-dark'
                : 'bg-white ring-black/5 text-muted'
            "
            @click="toggleModule(key)"
          >
            {{ t(`modules.${key}`) }}
          </button>
        </div>
        <button type="button" class="w-full rounded-2xl bg-sage py-3 text-white" @click="step = 2">
          {{ t('onboarding.continue') }}
        </button>
      </div>

      <div v-else class="mt-6 space-y-4">
        <p class="text-sm text-muted">{{ t('onboarding.routines') }}</p>
        <label class="block text-sm">
          {{ t('onboarding.wake') }}
          <input v-model="form.wakeTime" type="time" class="mt-1 w-full rounded-xl border-0 bg-sand px-3 py-2" />
        </label>
        <label class="block text-sm">
          {{ t('onboarding.sleep') }}
          <input v-model="form.sleepTime" type="time" class="mt-1 w-full rounded-xl border-0 bg-sand px-3 py-2" />
        </label>
        <label class="block text-sm">
          {{ t('onboarding.goal') }}
          <input
            v-model="form.mainGoal"
            type="text"
            class="mt-1 w-full rounded-xl border-0 bg-sand px-3 py-2"
          />
        </label>
        <button
          type="button"
          class="w-full rounded-2xl bg-sage py-3 text-white disabled:opacity-50"
          :disabled="busy || !form.activeModules.length"
          @click="finish"
        >
          {{ busy ? t('common.loading') : t('onboarding.finish') }}
        </button>
      </div>
    </div>
  </div>
</template>
