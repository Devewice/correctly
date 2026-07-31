<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { setLocale } from '@/plugins/i18n'
import PageHeader from '@/shared/components/PageHeader.vue'
import InstallAppCard from '@/shared/components/InstallAppCard.vue'
import { loadCarePrefs, saveCarePrefs } from '@/shared/utils/carePrefs'
import { RITUALS } from '@/shared/data/rituals'

const { t } = useI18n()
const auth = useAuthStore()
const saved = ref(false)
const busy = ref(false)

const moduleKeys = [
  'meals',
  'water',
  'mood',
  'sleep',
  'habits',
  'activity',
  'journal',
  'meditation',
  'weight',
]

function initialModules() {
  const raw = auth.user?.activeModules
  if (Array.isArray(raw) && raw.length) return [...raw]
  return ['meals', 'water', 'mood', 'sleep', 'habits']
}

const form = reactive({
  name: auth.user?.name || '',
  language: auth.user?.language || 'es',
  timezone: auth.user?.timezone || 'America/Bogota',
  wakeTime: auth.user?.wakeTime || '07:00',
  sleepTime: auth.user?.sleepTime || '23:00',
  activeModules: initialModules(),
})

const prefs = ref(loadCarePrefs(auth.user?.id))

function toggleLowEnergy() {
  prefs.value = saveCarePrefs(auth.user?.id, { lowEnergy: !prefs.value.lowEnergy })
}

function setRitual(id) {
  const next = prefs.value.ritualId === id ? null : id
  prefs.value = saveCarePrefs(auth.user?.id, { ritualId: next })
}

const languages = [
  { title: 'Español', value: 'es' },
  { title: 'English', value: 'en' },
  { title: 'Português', value: 'pt' },
]

function toggleModule(key) {
  const i = form.activeModules.indexOf(key)
  if (i >= 0) {
    if (form.activeModules.length <= 1) return
    form.activeModules.splice(i, 1)
  } else form.activeModules.push(key)
}

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
  <PageHeader :title="t('nav.profile')" />

  <InstallAppCard />

  <v-card class="pa-5 mb-4">
    <v-form @submit.prevent="save">
      <v-text-field v-model="form.name" :label="t('profile.name')" class="mb-2" />
      <v-select
        v-model="form.language"
        :items="languages"
        :label="t('onboarding.language')"
        class="mb-2"
      />
      <v-text-field
        v-model="form.timezone"
        :label="t('onboarding.timezone')"
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

      <p class="text-body-2 text-medium-emphasis mb-2">{{ t('onboarding.modules') }}</p>
      <v-row dense class="mb-4">
        <v-col v-for="key in moduleKeys" :key="key" cols="6">
          <button
            type="button"
            class="select-tile"
            :class="{ 'select-tile--on': form.activeModules.includes(key) }"
            @click="toggleModule(key)"
          >
            {{ t(`modules.${key}`) }}
          </button>
        </v-col>
      </v-row>

      <p class="text-body-2 text-medium-emphasis mb-2">{{ t('day.lowEnergy') }} / {{ t('rituals.morning.title') }}</p>
      <div class="d-flex flex-wrap ga-2 mb-4">
        <button
          type="button"
          class="select-tile"
          :class="{ 'select-tile--on': prefs.lowEnergy }"
          style="width: auto"
          @click="toggleLowEnergy"
        >
          {{ t('day.lowEnergy') }}
        </button>
        <button
          v-for="r in RITUALS"
          :key="r.id"
          type="button"
          class="select-tile"
          :class="{ 'select-tile--on': prefs.ritualId === r.id }"
          style="width: auto"
          @click="setRitual(r.id)"
        >
          {{ r.icon }} {{ t(`rituals.${r.id}.short`) }}
        </button>
      </div>

      <v-btn type="submit" block color="primary" size="large" :loading="busy">
        {{ t('common.save') }}
      </v-btn>
      <v-alert v-if="saved" type="success" density="compact" class="mt-3">
        {{ t('common.saved') }}
      </v-alert>
    </v-form>
  </v-card>

  <v-card class="pa-4 mt-4" variant="flat" color="surface-light">
    <div class="text-body-2 font-weight-medium">{{ auth.user?.email }}</div>
    <div class="text-caption text-medium-emphasis mt-1">
      XP: {{ auth.user?.stats?.totalXP || 0 }} · Level {{ auth.user?.stats?.level || 1 }}
    </div>
  </v-card>
</template>
