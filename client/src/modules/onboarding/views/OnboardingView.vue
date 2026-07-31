<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { setLocale } from '@/plugins/i18n'
import { fadeUp, withDelay } from '@/shared/motion/presets'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const step = ref(0)
const busy = ref(false)

const detectedTz =
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota'

const form = reactive({
  language: locale.value,
  timezone: detectedTz,
  activeModules: ['meals', 'water', 'mood', 'sleep', 'habits'],
  wakeTime: '07:00',
  sleepTime: '23:00',
  mealTimes: {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:30',
  },
  mainGoal: 'mood',
  habits: [
    { name: 'Vitaminas', icon: '💊' },
    { name: 'Leer 15 min', icon: '📖' },
    { name: 'Estiramiento', icon: '🧘' },
  ],
})

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

const goalKeys = ['water', 'sleep', 'mood', 'activity']

function toggleModule(key) {
  const i = form.activeModules.indexOf(key)
  if (i >= 0) {
    if (form.activeModules.length <= 1) return
    form.activeModules.splice(i, 1)
  } else form.activeModules.push(key)
}

function removeHabit(idx) {
  form.habits.splice(idx, 1)
}

function addHabit() {
  if (form.habits.length >= 6) return
  form.habits.push({ name: '', icon: '✨' })
}

async function finish() {
  busy.value = true
  try {
    setLocale(form.language)
    const habits = form.activeModules.includes('habits')
      ? form.habits.filter((h) => h.name.trim()).map((h) => ({
          name: h.name.trim(),
          icon: h.icon || '✨',
        }))
      : []
    const data = await api('/user/onboarding', {
      method: 'PUT',
      body: {
        language: form.language,
        timezone: form.timezone,
        activeModules: form.activeModules,
        wakeTime: form.wakeTime,
        sleepTime: form.sleepTime,
        mealTimes: form.mealTimes,
        mainGoal: form.mainGoal,
        habits,
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
  <v-main>
    <v-container class="fill-height py-4 py-sm-10 px-3" style="max-width: 520px">
      <v-card
        v-motion
        :initial="{ opacity: 0, y: 28, scale: 0.97 }"
        :enter="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 120, damping: 16 },
        }"
        class="pa-4 pa-sm-8 w-100 cx-card-shell"
      >
        <div
          v-motion
          v-bind="withDelay(fadeUp, 60)"
          class="text-caption text-primary text-uppercase font-weight-bold"
        >
          {{ t('app.name') }}
        </div>
        <h1
          v-motion
          v-bind="withDelay(fadeUp, 120)"
          class="text-h4 font-weight-bold mt-2"
        >
          {{ t('onboarding.welcome') }}
        </h1>
        <p class="text-caption text-medium-emphasis mt-1">
          {{ t('onboarding.stepOf', { n: step + 1, total: 5 }) }}
        </p>

        <v-window v-model="step" class="mt-6">
          <v-window-item :value="0">
            <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.language') }}</p>
            <div class="d-flex ga-2 mb-6">
              <button
                v-for="lang in ['es', 'en', 'pt']"
                :key="lang"
                type="button"
                class="select-tile"
                :class="{ 'select-tile--on': form.language === lang }"
                style="width: auto; min-width: 4.5rem"
                @click="form.language = lang; setLocale(lang)"
              >
                {{ lang }}
              </button>
            </div>
            <v-btn block color="primary" size="large" @click="step = 1">
              {{ t('onboarding.continue') }}
            </v-btn>
          </v-window-item>

          <v-window-item :value="1">
            <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.modules') }}</p>
            <v-row dense class="mb-6">
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
            <v-btn
              block
              color="primary"
              size="large"
              :disabled="!form.activeModules.length"
              @click="step = 2"
            >
              {{ t('onboarding.continue') }}
            </v-btn>
          </v-window-item>

          <v-window-item :value="2">
            <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.routines') }}</p>
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
              class="mb-2"
            />
            <v-text-field
              v-model="form.timezone"
              :label="t('onboarding.timezone')"
              class="mb-4"
              hint="America/Bogota"
              persistent-hint
            />
            <v-btn block color="primary" size="large" @click="step = 3">
              {{ t('onboarding.continue') }}
            </v-btn>
          </v-window-item>

          <v-window-item :value="3">
            <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.mealsRhythm') }}</p>
            <v-text-field
              v-model="form.mealTimes.breakfast"
              type="time"
              :label="t('meals.types.breakfast')"
              class="mb-2"
            />
            <v-text-field
              v-model="form.mealTimes.lunch"
              type="time"
              :label="t('meals.types.lunch')"
              class="mb-2"
            />
            <v-text-field
              v-model="form.mealTimes.dinner"
              type="time"
              :label="t('meals.types.dinner')"
              class="mb-4"
            />
            <v-btn block color="primary" size="large" @click="step = 4">
              {{ t('onboarding.continue') }}
            </v-btn>
          </v-window-item>

          <v-window-item :value="4">
            <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.goalPick') }}</p>
            <div class="d-flex flex-wrap ga-2 mb-5">
              <button
                v-for="g in goalKeys"
                :key="g"
                type="button"
                class="select-tile"
                :class="{ 'select-tile--on': form.mainGoal === g }"
                style="width: auto"
                @click="form.mainGoal = g"
              >
                {{ t(`onboarding.goals.${g}`) }}
              </button>
            </div>

            <template v-if="form.activeModules.includes('habits')">
              <p class="text-body-2 text-medium-emphasis mb-2">{{ t('onboarding.habitsEdit') }}</p>
              <div
                v-for="(h, idx) in form.habits"
                :key="idx"
                class="d-flex ga-2 mb-2 align-center"
              >
                <v-text-field
                  v-model="h.icon"
                  style="max-width: 64px"
                  density="compact"
                  hide-details
                />
                <v-text-field v-model="h.name" density="compact" hide-details class="flex-grow-1" />
                <v-btn icon="mdi-close" variant="text" size="small" @click="removeHabit(idx)" />
              </div>
              <v-btn variant="tonal" size="small" class="mb-4" @click="addHabit">
                {{ t('onboarding.addHabit') }}
              </v-btn>
            </template>

            <v-btn block color="primary" size="large" :loading="busy" @click="finish">
              {{ t('onboarding.finish') }}
            </v-btn>
          </v-window-item>
        </v-window>
      </v-card>
    </v-container>
  </v-main>
</template>
