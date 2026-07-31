<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useDashboardStore } from '@/modules/dashboard/stores/useDashboardStore'
import { useDayGuide } from '@/modules/dashboard/composables/useDayGuide'
import { api } from '@/shared/api/client'
import DayGuideCard from '@/modules/dashboard/components/DayGuideCard.vue'
import DayCloseSummary from '@/modules/dashboard/components/DayCloseSummary.vue'
import StepCompleteBurst from '@/modules/dashboard/components/StepCompleteBurst.vue'
import { fadeUp, withDelay } from '@/shared/motion/presets'
import { glassesFromMl } from '@/shared/utils/water'
import { addDaySkip, loadDaySkips } from '@/shared/utils/daySkips'
import { activeModuleSet, dateKeyLocal } from '@/shared/utils/timeContext'
import { loadCarePrefs, saveCarePrefs } from '@/shared/utils/carePrefs'
import { RITUALS } from '@/shared/data/rituals'
import { celebrateCompanion, syncCompanionFromDay } from '@/shared/companions/companionBus'

const { t } = useI18n()
const { lgAndUp } = useDisplay()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dash = useDashboardStore()

const skipped = ref(new Set())
const busy = ref(false)
const prefs = ref(loadCarePrefs(auth.user?.id))
const burst = ref(false)
const burstLabel = ref('')
/** left = skip (Tinder pass), right = completar */
const deckExit = ref('right')

const userRef = computed(() => auth.user)
const { steps, suggestedMealType, band, caredFor } = useDayGuide(
  computed(() => dash.today),
  userRef,
  skipped,
  prefs,
)

const current = computed(() => steps.value[0] || { id: 'done', key: 'done' })
const peek = computed(() => steps.value[1] || null)

const peekTitle = computed(() => {
  const s = peek.value
  if (!s) return ''
  const map = {
    mood: 'day.moodAsk',
    water: 'day.waterAsk',
    meal: 'day.mealAsk',
    habit: 'day.habitAsk',
    sleep: 'day.sleepAsk',
    meditation: 'day.meditationAsk',
    activity: 'day.activityAsk',
    journal: 'day.journalAsk',
    rest: 'day.restTitle',
    done: 'day.doneTitle',
  }
  return t(map[s.key] || 'day.doneTitle')
})
const progressPct = computed(() => dash.today?.progress ?? 0)
const mods = computed(() => activeModuleSet(auth.user))
const dayFinished = computed(
  () => current.value?.key === 'done' || current.value?.key === 'rest',
)

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

const freezes = computed(() => dash.today?.stats?.streakFreezesRemaining ?? 0)

function syncSkips() {
  const date = dash.today?.date || dateKeyLocal()
  skipped.value = loadDaySkips(auth.user?.id, date)
}

function syncPrefs() {
  prefs.value = loadCarePrefs(auth.user?.id)
}

function toggleLowEnergy() {
  prefs.value = saveCarePrefs(auth.user?.id, { lowEnergy: !prefs.value.lowEnergy })
}

function setRitual(id) {
  const next = prefs.value.ritualId === id ? null : id
  prefs.value = saveCarePrefs(auth.user?.id, { ritualId: next })
}

function flashComplete(label) {
  burstLabel.value = label
  burst.value = true
  window.setTimeout(() => {
    burst.value = false
  }, 700)
  celebrateCompanion('happy', 2400)
}

watch(
  () => [dash.today?.date, auth.user?.id],
  () => {
    syncSkips()
    syncPrefs()
  },
  { immediate: true },
)

watch(dayFinished, (done, was) => {
  if (done && was === false) celebrateCompanion('proud', 3200)
})

onMounted(async () => {
  await dash.loadAll()
  syncSkips()
  syncPrefs()
  await handleQuickAction()
})

async function handleQuickAction() {
  const action = route.query.action || route.query.quick
  if (!action) return
  try {
    if (action === 'water' || action === '1') {
      const ml = Number(route.query.ml) || 250
      await api('/water', { method: 'POST', body: { amount: ml } })
      flashComplete(t('day.burstWater'))
    } else if (action === 'mood') {
      const mood = Number(route.query.mood) || 4
      await api('/mood', { method: 'POST', body: { mood } })
      flashComplete(t('day.burstMood'))
    }
    await dash.loadAll()
    syncCompanionFromDay(dash.today)
  } finally {
    router.replace({ path: '/dashboard', query: {} })
  }
}

function skip(meta) {
  if (!current.value || !dash.today) return
  // Si ya voló con el dedo, no repetir la animación CSS
  deckExit.value = meta?.fromSwipe ? 'instant' : 'left'
  skipped.value = addDaySkip(auth.user?.id, dash.today.date, current.value.id)
}

async function withBusy(fn, burstKey) {
  busy.value = true
  deckExit.value = 'right'
  try {
    await fn()
    if (burstKey) flashComplete(t(burstKey))
    await dash.loadAll()
    syncCompanionFromDay(dash.today)
    syncSkips()
  } finally {
    busy.value = false
  }
}

async function onMood(mood) {
  await withBusy(() => api('/mood', { method: 'POST', body: { mood } }), 'day.burstMood')
}

async function onWater(amount) {
  await withBusy(() => api('/water', { method: 'POST', body: { amount } }), 'day.burstWater')
}

async function onMeal({ type, description }) {
  await withBusy(
    () =>
      api('/meals', {
        method: 'POST',
        body: { type, description, satisfaction: 3, quality: 4 },
      }),
    'day.burstMeal',
  )
}

async function onHabit(habit) {
  await withBusy(
    () =>
      api(`/habits/${habit.id}/complete`, {
        method: 'POST',
        body: { date: dash.today.date },
      }),
    'day.burstHabit',
  )
}

async function onSleep(opt) {
  const wake = new Date()
  const bed = new Date(wake.getTime() - opt.hours * 60 * 60 * 1000)
  await withBusy(
    () =>
      api('/sleep', {
        method: 'POST',
        body: {
          bedTime: bed.toISOString(),
          wakeTime: wake.toISOString(),
          quality: opt.quality,
        },
      }),
    'day.burstSleep',
  )
}

async function onMeditation(minutes) {
  await withBusy(
    () =>
      api('/meditation', {
        method: 'POST',
        body: { duration: minutes, type: 'breathing', feeling: 'calmer' },
      }),
    'day.burstDone',
  )
}

async function onActivity(payload) {
  await withBusy(() => api('/activities', { method: 'POST', body: payload }), 'day.burstDone')
}

async function onJournal(content) {
  await withBusy(
    () =>
      api('/journal', {
        method: 'POST',
        body: { content, type: 'evening' },
      }),
    'day.burstDone',
  )
}

const moodEmoji = ['', '😢', '😕', '😐', '🙂', '😄']
</script>

<template>
  <StepCompleteBurst :show="burst" :label="burstLabel" />

  <div v-if="dash.loading && !dash.today" class="py-16 text-center text-medium-emphasis">
    {{ t('common.loading') }}
  </div>

  <div
    v-else-if="dash.today"
    class="today-view pb-8 pb-md-4"
    :class="`today-view--${band}`"
  >
    <header v-motion v-bind="withDelay(fadeUp, 0)" class="today-view__header">
      <div class="today-view__title-row">
        <h1 class="cx-page-title">{{ greeting }}</h1>
        <span class="today-view__pct" aria-label="progress">{{ progressPct }}%</span>
      </div>
      <p class="cx-meta today-view__meta">
        <span>{{ t(`day.band.${band}`) }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ t('dashboard.streak', { days: dash.today.stats?.currentStreak || 0 }) }}</span>
        <template v-if="freezes > 0">
          <span aria-hidden="true">·</span>
          <span>{{ t('day.freezeLeft', { n: freezes }) }}</span>
        </template>
      </p>
      <v-progress-linear
        class="today-view__bar mt-3"
        :model-value="progressPct"
        color="primary"
        height="6"
        rounded
      />
      <div v-if="chips.length" class="today-progress__chips">
        <span v-for="chip in chips" :key="chip.key" class="today-progress__chip">
          {{ chip.label }}
        </span>
      </div>
    </header>

    <v-row :dense="!lgAndUp">
      <v-col cols="12" lg="7" order="1" order-lg="2">
        <p class="cx-section-label">{{ t('day.guideTitle') }}</p>

        <div class="guide-deck">
          <div v-if="peek" class="guide-deck__back" aria-hidden="true">
            <div class="guide-deck__back-card">
              <div class="guide-deck__back-title">{{ peekTitle }}</div>
              <div class="guide-deck__back-meta">{{ t('day.nextUp') }}</div>
            </div>
          </div>

          <Transition :name="`guide-${deckExit}`" mode="out-in">
            <DayGuideCard
              :key="current.id"
              :step="current"
              :meal-type="suggestedMealType"
              :date-key="dash.today.date"
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
          </Transition>
        </div>

        <DayCloseSummary
          v-if="dayFinished || (progressPct >= 80 && caredFor.length)"
          class="mt-4"
          :cared-for="caredFor"
          :progress="progressPct"
          :streak="dash.today.stats?.currentStreak || 0"
        />
      </v-col>

      <v-col cols="12" lg="5" order="2" order-lg="1" class="today-view__aside">
        <p v-if="insightText" class="today-insight today-insight--panel">{{ insightText }}</p>

        <details class="today-prefs">
          <summary>{{ t('day.dayPrefs') }}</summary>
          <div class="today-prefs__body">
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
        </details>

        <v-btn
          class="mt-1"
          variant="text"
          size="small"
          to="/practices"
          prepend-icon="mdi-spa-outline"
        >
          {{ t('practices.open') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.today-view {
  --today-glow: rgba(127, 159, 124, 0.16);
  position: relative;
  isolation: isolate;
  overflow: visible;
  padding: 0 0 0.5rem;
}
/* Full-bleed: el glow sale del padding del container y llega a los bordes */
.today-view::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: -0.75rem;
  left: 50%;
  width: 100vw;
  height: min(300px, 52vw);
  transform: translateX(-50%);
  border-radius: 0;
  background: radial-gradient(85% 95% at 18% 0%, var(--today-glow), transparent 72%);
  pointer-events: none;
}
.today-view--morning {
  --today-glow: rgba(239, 196, 160, 0.42);
}
.today-view--midday {
  --today-glow: rgba(127, 159, 124, 0.28);
}
.today-view--afternoon {
  --today-glow: rgba(201, 184, 216, 0.34);
}
.today-view--evening,
.today-view--rest {
  --today-glow: rgba(42, 115, 150, 0.2);
}
.today-view__header {
  margin-bottom: 1.15rem;
}
.today-view__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.today-view__pct {
  flex-shrink: 0;
  margin-top: 0.2rem;
  font-family: var(--cx-font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--cx-primary-deep);
}
.today-view__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.35rem;
  margin-top: 0.35rem;
}
.today-view__bar {
  max-width: 20rem;
}
.today-view__aside {
  margin-top: 0.35rem;
}
.today-progress__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.7rem;
}
.today-progress__chip {
  padding: 0.28rem 0.7rem;
  border-radius: 999px;
  background: var(--cx-surface-soft);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cx-text-soft);
  border: none;
}
.today-insight {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--cx-text-soft);
}
.today-insight--panel {
  padding: 0.95rem 1.05rem;
  border-radius: var(--cx-radius);
  background: var(--cx-surface-tint);
  margin-bottom: 0.95rem;
}
.today-prefs {
  margin-top: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: var(--cx-radius);
  background: var(--cx-surface-soft);
}
.today-prefs summary {
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cx-text-soft);
  list-style: none;
}
.today-prefs summary::-webkit-details-marker {
  display: none;
}
.today-prefs__body {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.55rem;
}
.guide-deck {
  position: relative;
  isolation: isolate;
  min-height: 12rem;
}
.guide-deck__back {
  position: absolute;
  inset: 10px 8px -6px;
  z-index: 0;
  pointer-events: none;
}
.guide-deck__back-card {
  height: 100%;
  min-height: 7.5rem;
  padding: 1.1rem 1.2rem;
  border-radius: var(--cx-radius-lg);
  background: var(--cx-surface-soft);
  transform: scale(0.96);
  opacity: 0.85;
}
.guide-deck__back-title {
  font-family: var(--cx-font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--cx-text-soft);
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.guide-deck__back-meta {
  margin-top: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--cx-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.guide-deck :deep(.day-guide-card) {
  position: relative;
  z-index: 1;
}

/* Tinder-like deck transitions */
.guide-left-enter-active,
.guide-right-enter-active {
  transition:
    opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.guide-left-leave-active,
.guide-right-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.32s cubic-bezier(0.4, 0, 0.7, 0.2);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 2;
  pointer-events: none;
}
.guide-left-enter-from,
.guide-right-enter-from {
  opacity: 0;
  transform: translateY(36px) scale(0.92) rotate(-2deg);
}
.guide-left-leave-to {
  opacity: 0;
  transform: translateX(-120%) rotate(-14deg);
}
.guide-right-leave-to {
  opacity: 0;
  transform: translateX(120%) rotate(14deg);
}
.guide-instant-enter-active {
  transition:
    opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.guide-instant-leave-active {
  transition: none;
}
.guide-instant-enter-from {
  opacity: 0;
  transform: translateY(36px) scale(0.92);
}
.guide-instant-leave-to {
  opacity: 0;
}
@media (min-width: 1280px) {
  .today-view__aside {
    margin-top: 1.65rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .guide-left-enter-active,
  .guide-right-enter-active,
  .guide-left-leave-active,
  .guide-right-leave-active {
    transition: none;
  }
}
</style>
