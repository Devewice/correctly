<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { setLocale } from '@/plugins/i18n'

const { t } = useI18n()
const auth = useAuthStore()
const saved = ref(false)
const busy = ref(false)
const form = reactive({
  name: auth.user?.name || '',
  language: auth.user?.language || 'es',
  wakeTime: auth.user?.wakeTime || '07:00',
  sleepTime: auth.user?.sleepTime || '23:00',
})

const languages = [
  { title: 'Español', value: 'es' },
  { title: 'English', value: 'en' },
  { title: 'Português', value: 'pt' },
]

async function save() {
  busy.value = true
  try {
    const data = await api('/user/profile', {
      method: 'PUT',
      body: { ...form },
    })
    auth.user = data.user
    setLocale(form.language)
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <h1 class="text-h4 font-weight-bold mb-4">{{ t('nav.profile') }}</h1>

  <v-card class="pa-5 mb-4" tag="form" @submit.prevent="save">
    <v-text-field v-model="form.name" label="Name" class="mb-2" />
    <v-select
      v-model="form.language"
      :items="languages"
      :label="t('onboarding.language')"
      class="mb-2"
    />
    <v-text-field
      v-model="form.wakeTime"
      type="time"
      :label="t('onboarding.wake')"
      class="mb-2"
    />
    <v-text-field
      v-model="form.sleepTime"
      type="time"
      :label="t('onboarding.sleep')"
      class="mb-4"
    />
    <v-btn type="submit" block color="primary" size="large" :loading="busy">
      {{ t('common.save') }}
    </v-btn>
    <v-alert v-if="saved" type="success" variant="tonal" density="compact" class="mt-3">
      ✓
    </v-alert>
  </v-card>

  <v-card class="pa-4" variant="tonal">
    <div class="text-body-2">{{ auth.user?.email }}</div>
    <div class="text-caption text-medium-emphasis">
      XP: {{ auth.user?.stats?.totalXP || 0 }} · Level {{ auth.user?.stats?.level || 1 }}
    </div>
  </v-card>
</template>
