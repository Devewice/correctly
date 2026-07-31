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
import { addDaySkip, loadDaySkips } from '@/shared/utils/daySkips'
import { activeModuleSet, dateKeyLocal } from '@/shared/utils/timeContext'

const { t } = useI18n()
const { lgAndUp } = useDisplay()
const auth = useAuthStore()
const dash = useDashboardStore()

const skipped = ref(new Set())
const busy = ref(false)

const userRef = computed(() => auth.user)
const { steps, suggestedMealType, band } = useDayGuide(
  computed(() => dash.today),
  userRef,
  skipped,
)

const current = computed(() => steps.value[0] || null)

const progressPct = computed(() => dash.today?.progress ?? 0)

const mods = computed(() => activeModuleSet(auth.user))

const greeting = computed(() => {
  const name = auth.user?.name?.split(' ')[0] || ''
  if (band.value === 'morning') return t('dashboard.greetingMorning', { name })
  if (band.value === 'evening' || band.value === 'rest') {
    return t('dashboard.greetingEvening', { name })
  }
  return t('dashboard.greetingAfternoon', { name })
})

const chips = computed(() => {
  if (!dash.today) return []
  const out = []
  if (mods.value.has('mood')) {
    out.push({
      key: 'mood',
      label: dash.today.summary.latestMood
        ? moodEmoji[dash.today.summary.latestMood.mood]
        : t('day.chipMoodPending'),
    })
  }
  if (mods.value.has('water')) {
    out.push({
      key: 'water',
      label: t('day.chipGlasses', {
        n: glassesFromMl(dash.today.summary.waterMl),
      }),
    })
  }
  if (mods.value.has('meals')) {
    out.push({
      key: 'meals',
      label: t('day.chipMeals', {
        n: dash.today.summary.mealsCount || 0,
      }),
    })
  }
  return out
})

const insightText = computed(() => {
  const insight = dash.insights?.[0]
  if (!insight) return ''
  return t(insight.messageKey, insight.params || {})
})

function syncSkips() {
  const date = dash.today?.date || dateKeyLocal()
  skipped.value = loadDaySkips(auth.user?.id, date)
}

watch(
  () => [dash.today?.date, auth.user?.id],
  () => syncSkips(),
  { immediate: true },
)

onMounted(async () => {
  await dash.loadAll()
  syncSkips()
})

function skip() {
  if (!current.value || !dash.today) return
  skipped.value = addDaySkip(auth.user?.id, dash.today.date, current.value.id)
}

async function withBusy(fn) {
  busy.value = true
  try {
    await fn()
    await dash.loadAll()
    syncSkips()
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

async function onSleep(opt) {
  const wake = new Date()
  const bed = new Date(wake.getTime() - opt.hours * 60 * 60 * 1000)
  await withBusy(() =>
    api('/sleep', {
      method: 'POST',
      body: {
        bedTime: bed.toISOString(),
        wakeTime: wake.toISOString(),
        quality: opt.quality,
      },
    }),
  )
}

async function onMeditation(minutes) {
  await withBusy(() =>
    api('/meditation', {
      method: 'POST',
      body: { duration: minutes, type: 'breathing', feeling: 'calmer' },
    }),
  )
}

async function onActivity(payload) {
  await withBusy(() => api('/activities', { method: 'POST', body: payload }))
}

async function onJournal(content) {
  await withBusy(() =>
    api('/journal', {
      method: 'POST',
      body: { content, type: 'evening' },
    }),
  )
}

const moodEmoji = ['', '😢', '😕', '😐', '🙂', '😄']
</script>

<template>
  <div v-if="dash.loading && !dash.today" class="py-16 text-center text-medium-emphasis">
    {{ t('common.loading') }}
  </div>

  <div v-else-if="dash.today" class="today-view pb-8 pb-md-4">
    <!-- 1. Cabecera corta -->
    <header v-motion v-bind="withDelay(fadeUp, 0)" class="today-view__header">
      <h1 class="today-view__greeting">{{ greeting }}</h1>
      <p class="today-view__meta">
        <span>{{ t(`day.band.${band}`) }}</span>
        <span class="today-view__dot" aria-hidden="true">·</span>
        <span>{{ t('dashboard.streak', { days: dash.today.stats?.currentStreak || 0 }) }}</span>
      </p>
    </header>

    <v-row :dense="!lgAndUp" class="today-view__row">
      <!-- 2. Acción principal primero (en móvil va arriba) -->
      <v-col cols="12" lg="7" order="1" order-lg="2" class="today-view__focus">
        <p class="today-view__focus-label">{{ t('day.guideTitle') }}</p>

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
          @sleep="onSleep"
          @meditation="onMeditation"
          @activity="onActivity"
          @journal="onJournal"
          @skip="skip"
        />
      </v-col>

      <!-- 3. Progreso e insight secundarios -->
      <v-col cols="12" lg="5" order="2" order-lg="1" class="today-view__aside">
        <div
          v-motion
          v-bind="withDelay(fadeUp, 80)"
          class="today-progress"
        >
          <div class="today-progress__top">
            <span class="today-progress__label">{{ t('day.dayProgress') }}</span>
            <span class="today-progress__pct">{{ progressPct }}%</span>
          </div>
          <v-progress-linear :model-value="progressPct" color="primary" height="8" rounded />
          <div v-if="chips.length" class="today-progress__chips">
            <span v-for="chip in chips" :key="chip.key" class="today-progress__chip">
              {{ chip.label }}
            </span>
          </div>
        </div>

        <p
          v-if="insightText"
          v-motion
          v-bind="withDelay(fadeUp, 120)"
          class="today-insight"
        >
          {{ insightText }}
        </p>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.today-view__header {
  margin-bottom: 1rem;
}

.today-view__greeting {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
  color: #3d3d3d;
  margin: 0;
}

.today-view__meta {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: rgba(61, 61, 61, 0.72);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.35rem;
}

.today-view__dot {
  opacity: 0.5;
}

.today-view__focus-label {
  margin: 0 0 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5e7a5b;
}

.today-view__aside {
  margin-top: 0.25rem;
}

.today-progress {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(139, 168, 136, 0.14);
  border: 1px solid rgba(94, 122, 91, 0.16);
}

.today-progress__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.45rem;
}

.today-progress__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3d3d3d;
}

.today-progress__pct {
  font-size: 1rem;
  font-weight: 700;
  color: #5e7a5b;
}

.today-progress__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.65rem;
}

.today-progress__chip {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  color: #3d3d3d;
  border: 1px solid rgba(94, 122, 91, 0.12);
}

.today-insight {
  margin: 0.85rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: rgba(61, 61, 61, 0.75);
}

@media (min-width: 1280px) {
  .today-view__greeting {
    font-size: 1.75rem;
  }

  .today-view__header {
    margin-bottom: 1.25rem;
  }

  .today-view__aside {
    margin-top: 1.65rem;
  }
}
</style>
