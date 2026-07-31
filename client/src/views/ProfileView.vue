<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { setLocale } from '@/i18n'

const { t } = useI18n()
const auth = useAuthStore()
const saved = ref(false)
const form = reactive({
  name: auth.user?.name || '',
  language: auth.user?.language || 'es',
  wakeTime: auth.user?.wakeTime || '07:00',
  sleepTime: auth.user?.sleepTime || '23:00',
})

async function save() {
  const data = await api('/user/profile', {
    method: 'PUT',
    body: { ...form },
  })
  auth.user = data.user
  setLocale(form.language)
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}
</script>

<template>
  <AppShell>
    <h1 class="mb-4 font-display text-3xl font-800">{{ t('nav.profile') }}</h1>

    <form class="space-y-3 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5" @submit.prevent="save">
      <label class="block text-sm">
        Name
        <input v-model="form.name" class="mt-1 w-full rounded-xl bg-sand px-3 py-2" />
      </label>
      <label class="block text-sm">
        {{ t('onboarding.language') }}
        <select v-model="form.language" class="mt-1 w-full rounded-xl bg-sand px-3 py-2">
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
        </select>
      </label>
      <label class="block text-sm">
        {{ t('onboarding.wake') }}
        <input v-model="form.wakeTime" type="time" class="mt-1 w-full rounded-xl bg-sand px-3 py-2" />
      </label>
      <label class="block text-sm">
        {{ t('onboarding.sleep') }}
        <input v-model="form.sleepTime" type="time" class="mt-1 w-full rounded-xl bg-sand px-3 py-2" />
      </label>
      <button type="submit" class="w-full rounded-2xl bg-sage py-3 text-white">
        {{ t('common.save') }}
      </button>
      <p v-if="saved" class="text-center text-sm text-success">✓</p>
    </form>

    <div class="mt-6 rounded-3xl bg-sand/80 p-4 text-sm text-muted">
      <p>{{ auth.user?.email }}</p>
      <p>XP: {{ auth.user?.stats?.totalXP || 0 }} · Level {{ auth.user?.stats?.level || 1 }}</p>
    </div>
  </AppShell>
</template>
