<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { api } from '@/utils/api'

const { t } = useI18n()
const auth = useAuthStore()
const dash = useDashboardStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  const name = auth.user?.name?.split(' ')[0] || ''
  if (h < 12) return t('dashboard.greetingMorning', { name })
  if (h < 19) return t('dashboard.greetingAfternoon', { name })
  return t('dashboard.greetingEvening', { name })
})

const moodEmoji = ['', '😢', '😕', '😐', '🙂', '😄']

onMounted(() => dash.loadAll())

async function toggleHabit(habit) {
  if (habit.completedToday) {
    await api(`/habits/${habit.id}/complete?date=${dash.today.date}`, { method: 'DELETE' })
  } else {
    await api(`/habits/${habit.id}/complete`, {
      method: 'POST',
      body: { date: dash.today.date },
    })
  }
  await dash.loadAll()
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function itemLabel(item) {
  if (item.kind === 'meal') return t(`meals.types.${item.title}`)
  if (item.kind === 'water') return t('dashboard.water')
  if (item.kind === 'mood') return t('dashboard.mood')
  if (item.kind === 'sleep') return t('dashboard.sleep')
  return item.title
}
</script>

<template>
  <AppShell>
    <div v-if="dash.loading && !dash.today" class="py-20 text-center text-muted">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="dash.today" class="space-y-5 pb-8">
      <section
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0 }"
      >
        <h1 class="font-display text-3xl font-800 text-ink">{{ greeting }}</h1>
        <p class="mt-1 text-sm text-muted">
          {{ t('dashboard.streak', { days: dash.today.stats?.currentStreak || 0 }) }}
          · XP {{ dash.today.stats?.totalXP || 0 }}
        </p>
      </section>

      <section
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 80 } }"
        class="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-black/5"
      >
        <div class="mb-2 flex items-center justify-between text-sm">
          <span>{{ t('dashboard.progress', { pct: dash.today.progress }) }}</span>
          <span class="text-sage-dark">{{ dash.today.progress }}%</span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-sand">
          <div
            class="h-full rounded-full bg-gradient-to-r from-sage to-sage-light transition-all duration-700"
            :style="{ width: `${dash.today.progress}%` }"
          />
        </div>
      </section>

      <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <RouterLink
          to="/meals"
          class="rounded-3xl bg-peach/40 p-4 ring-1 ring-peach/50 transition hover:-translate-y-0.5"
        >
          <p class="text-xs text-muted">{{ t('dashboard.meals') }}</p>
          <p class="mt-1 font-display text-2xl font-extrabold">
            {{ dash.today.summary.mealsCount }}
          </p>
        </RouterLink>
        <RouterLink
          to="/water"
          class="rounded-3xl bg-sky/40 p-4 ring-1 ring-sky/50 transition hover:-translate-y-0.5"
        >
          <p class="text-xs text-muted">{{ t('dashboard.water') }}</p>
          <p class="mt-1 font-display text-2xl font-extrabold">
            {{ Math.round(dash.today.summary.waterMl / 10) / 100 }}L
          </p>
        </RouterLink>
        <RouterLink
          to="/mood"
          class="rounded-3xl bg-blush/35 p-4 ring-1 ring-blush/40 transition hover:-translate-y-0.5"
        >
          <p class="text-xs text-muted">{{ t('dashboard.mood') }}</p>
          <p class="mt-1 font-display text-2xl font-extrabold">
            {{
              dash.today.summary.latestMood
                ? moodEmoji[dash.today.summary.latestMood.mood]
                : '—'
            }}
          </p>
        </RouterLink>
        <RouterLink
          to="/sleep"
          class="rounded-3xl bg-lavender/40 p-4 ring-1 ring-lavender/50 transition hover:-translate-y-0.5"
        >
          <p class="text-xs text-muted">{{ t('dashboard.sleep') }}</p>
          <p class="mt-1 font-display text-2xl font-extrabold">
            {{
              dash.today.summary.sleep?.durationMin
                ? `${Math.round(dash.today.summary.sleep.durationMin / 60 * 10) / 10}h`
                : '—'
            }}
          </p>
        </RouterLink>
      </section>

      <section class="flex flex-wrap gap-2">
        <p class="w-full text-xs uppercase tracking-wide text-muted">{{ t('dashboard.more') }}</p>
        <RouterLink to="/meditation" class="rounded-full bg-lavender/50 px-3 py-1.5 text-xs">{{ t('nav.meditation') }}</RouterLink>
        <RouterLink to="/activity" class="rounded-full bg-sage/20 px-3 py-1.5 text-xs">{{ t('nav.activity') }}</RouterLink>
        <RouterLink to="/weight" class="rounded-full bg-peach/50 px-3 py-1.5 text-xs">{{ t('nav.weight') }}</RouterLink>
        <RouterLink to="/water" class="rounded-full bg-sky/40 px-3 py-1.5 text-xs">{{ t('nav.water') }}</RouterLink>
        <RouterLink to="/stats" class="rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-black/5">{{ t('nav.stats') }}</RouterLink>
      </section>

      <section
        v-if="dash.insights[0]"
        class="rounded-3xl bg-sage/10 p-4 text-sm text-sage-dark ring-1 ring-sage/20"
      >
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide">{{ t('dashboard.insight') }}</p>
        {{ t(dash.insights[0].messageKey, dash.insights[0].params || {}) }}
      </section>

      <section class="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-black/5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-xl font-700">{{ t('dashboard.timeline') }}</h2>
          <RouterLink to="/meals" class="text-sm text-sage-dark">+ {{ t('dashboard.quickLog') }}</RouterLink>
        </div>
        <ul v-if="dash.timeline.length" class="space-y-3">
          <li
            v-for="item in dash.timeline"
            :key="`${item.kind}-${item.id}`"
            class="flex items-start gap-3"
          >
            <span class="w-14 shrink-0 text-xs text-muted">{{ formatTime(item.at) }}</span>
            <div class="flex-1 rounded-2xl bg-sand/70 px-3 py-2">
              <p class="text-sm font-medium">{{ itemLabel(item) }}</p>
              <p v-if="item.detail" class="text-xs text-muted">{{ item.detail }}</p>
            </div>
          </li>
        </ul>
        <p v-else class="text-sm text-muted">{{ t('dashboard.emptyTimeline') }}</p>
      </section>

      <section class="rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-black/5">
        <h2 class="mb-3 font-display text-xl font-700">{{ t('dashboard.habits') }}</h2>
        <ul v-if="dash.today.habits.length" class="space-y-2">
          <li
            v-for="habit in dash.today.habits"
            :key="habit.id"
            class="flex items-center justify-between rounded-2xl bg-sand/60 px-3 py-2"
          >
            <span>{{ habit.icon }} {{ habit.name }}</span>
            <button
              type="button"
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="habit.completedToday ? 'bg-success text-white' : 'bg-white text-muted ring-1 ring-black/5'"
              @click="toggleHabit(habit)"
            >
              {{ habit.completedToday ? '✓' : '○' }}
            </button>
          </li>
        </ul>
        <p v-else class="text-sm text-muted">{{ t('habits.empty') }}</p>
      </section>
    </div>
  </AppShell>
</template>
