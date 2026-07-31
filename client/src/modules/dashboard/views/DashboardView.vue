<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useDashboardStore } from '@/modules/dashboard/stores/useDashboardStore'
import { useDayGuide } from '@/modules/dashboard/composables/useDayGuide'
import { api } from '@/shared/api/client'
import DayGuideCard from '@/modules/dashboard/components/DayGuideCard.vue'
import { fadeUp, withDelay } from '@/shared/motion/presets'
import { glassesFromMl } from '@/shared/utils/water'

const { t } = useI18n()
const { lgAndUp } = useDisplay()
const auth = useAuthStore()
const dash = useDashboardStore()
const { steps, suggestedMealType } = useDayGuide(computed(() => dash.today))

const stepIndex = ref(0)
const busy = ref(false)
const skipped = ref(new Set())

const greeting = computed(() => {
  const h = new Date().getHours()
  const name = auth.user?.name?.split(' ')[0] || ''
  if (h < 12) return t('dashboard.greetingMorning', { name })
  if (h < 19) return t('dashboard.greetingAfternoon', { name })
  return t('dashboard.greetingEvening', { name })
})

const visibleSteps = computed(() =>
  steps.value.filter((s) => !skipped.value.has(s.id)),
)

const current = computed(() => visibleSteps.value[stepIndex.value] || visibleSteps.value[0])

const progressPct = computed(() => dash.today?.progress ?? 0)

const chips = computed(() => {
  if (!dash.today) return []
  return [
    {
      key: 'mood',
      label: `${
        dash.today.summary.latestMood
          ? moodEmoji[dash.today.summary.latestMood.mood]
          : t('day.chipMoodPending')
      } ${t('dashboard.mood')}`,
    },
    {
      key: 'water',
      label: t('day.chipGlasses', {
        n: glassesFromMl(dash.today.summary.waterMl),
      }),
    },
    {
      key: 'meals',
      label: t('day.chipMeals', {
        n: dash.today.summary.mealsCount || 0,
      }),
    },
  ]
})

watch(visibleSteps, (list) => {
  if (stepIndex.value >= list.length) stepIndex.value = Math.max(0, list.length - 1)
})

onMounted(() => dash.loadAll())

function skip() {
  if (!current.value) return
  const next = new Set(skipped.value)
  next.add(current.value.id)
  skipped.value = next
}

async function withBusy(fn) {
  busy.value = true
  try {
    await fn()
    await dash.loadAll()
  } finally {
    busy.value = false
  }
}

async function onMood(mood) {
  await withBusy(() => api('/mood', { method: 'POST', body: { mood } }))
}

async function onWater(amount) {
  await withBusy(() => api('/water', { method: 'POST', body: { amount } }))
}

async function onMeal({ type, description }) {
  await withBusy(() =>
    api('/meals', {
      method: 'POST',
      body: { type, description, satisfaction: 3, quality: 4 },
    }),
  )
}

async function onHabit(habit) {
  await withBusy(() =>
    api(`/habits/${habit.id}/complete`, {
      method: 'POST',
      body: { date: dash.today.date },
    }),
  )
}

const moodEmoji = ['', '😢', '😕', '😐', '🙂', '😄']
</script>

<template>
  <div v-if="dash.loading && !dash.today" class="py-16 text-center text-medium-emphasis">
    {{ t('common.loading') }}
  </div>

  <div v-else-if="dash.today" class="pb-8 pb-md-4">
    <v-row :dense="!lgAndUp">
      <!-- Resumen: en desktop a la izquierda -->
      <v-col cols="12" lg="5">
        <header
          v-motion
          v-bind="withDelay(fadeUp, 0)"
          class="mb-5"
        >
          <p class="text-body-2 text-medium-emphasis mb-1">{{ t('day.todayLabel') }}</p>
          <h1 class="text-h4 text-md-h3 font-weight-bold">{{ greeting }}</h1>
          <p class="text-body-2 text-medium-emphasis mt-1">
            {{ t('dashboard.streak', { days: dash.today.stats?.currentStreak || 0 }) }}
          </p>
        </header>

        <v-card
          v-motion
          v-bind="withDelay(fadeUp, 100)"
          class="pa-4 pa-md-5 mb-5"
          variant="tonal"
          color="primary"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-body-2 font-weight-medium">{{ t('day.dayProgress') }}</span>
            <span class="text-h6 font-weight-bold">{{ progressPct }}%</span>
          </div>
          <v-progress-linear :model-value="progressPct" color="primary" height="10" />
          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-chip
              v-for="(chip, i) in chips"
              :key="chip.key"
              v-motion
              v-bind="withDelay(fadeUp, 180 + i * 60)"
              size="small"
              label
              variant="flat"
              color="surface"
            >
              {{ chip.label }}
            </v-chip>
          </div>
        </v-card>

        <v-alert
          v-if="dash.insights[0] && lgAndUp"
          v-motion
          v-bind="withDelay(fadeUp, 220)"
          type="success"
          :title="t('dashboard.insight')"
        >
          {{ t(dash.insights[0].messageKey, dash.insights[0].params || {}) }}
        </v-alert>
      </v-col>

      <!-- Guía interactiva: en desktop a la derecha (protagonista) -->
      <v-col cols="12" lg="7">
        <p
          v-motion
          v-bind="withDelay(fadeUp, 160)"
          class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-3"
        >
          {{ t('day.guideTitle') }}
        </p>

        <DayGuideCard
          v-if="current"
          :key="current.id"
          :step="current"
          :meal-type="suggestedMealType"
          :busy="busy"
          @mood="onMood"
          @water="onWater"
          @meal="onMeal"
          @habit="onHabit"
          @skip="skip"
        />

        <v-alert
          v-if="dash.insights[0] && !lgAndUp"
          v-motion
          v-bind="withDelay(fadeUp, 280)"
          type="success"
          class="mt-5"
          :title="t('dashboard.insight')"
        >
          {{ t(dash.insights[0].messageKey, dash.insights[0].params || {}) }}
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>
