<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useDashboardStore } from '@/modules/dashboard/stores/useDashboardStore'
import { api } from '@/shared/api/client'

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

const quickLinks = computed(() => [
  { to: '/meditation', title: t('nav.meditation') },
  { to: '/activity', title: t('nav.activity') },
  { to: '/weight', title: t('nav.weight') },
  { to: '/water', title: t('nav.water') },
  { to: '/stats', title: t('nav.stats') },
])

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
  <div v-if="dash.loading && !dash.today" class="py-16 text-center text-medium-emphasis">
    {{ t('common.loading') }}
  </div>

  <div v-else-if="dash.today" class="d-flex flex-column ga-4 pb-8">
    <section
      v-motion
      :initial="{ opacity: 0, y: 12 }"
      :enter="{ opacity: 1, y: 0 }"
    >
      <h1 class="text-h4 font-weight-bold">{{ greeting }}</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        {{ t('dashboard.streak', { days: dash.today.stats?.currentStreak || 0 }) }}
        · XP {{ dash.today.stats?.totalXP || 0 }}
      </p>
    </section>

    <v-card
      v-motion
      :initial="{ opacity: 0, y: 12 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 80 } }"
      class="pa-5"
    >
      <div class="d-flex justify-space-between text-body-2 mb-2">
        <span>{{ t('dashboard.progress', { pct: dash.today.progress }) }}</span>
        <span class="text-primary">{{ dash.today.progress }}%</span>
      </div>
      <v-progress-linear
        :model-value="dash.today.progress"
        color="primary"
        height="10"
        rounded
      />
    </v-card>

    <v-row dense>
      <v-col cols="6" md="3">
        <v-card :to="'/meals'" class="pa-4" color="secondary" variant="tonal">
          <div class="text-caption">{{ t('dashboard.meals') }}</div>
          <div class="text-h5 font-weight-bold">{{ dash.today.summary.mealsCount }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card :to="'/water'" class="pa-4" color="info" variant="tonal">
          <div class="text-caption">{{ t('dashboard.water') }}</div>
          <div class="text-h5 font-weight-bold">
            {{ Math.round(dash.today.summary.waterMl / 10) / 100 }}L
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card :to="'/mood'" class="pa-4" color="accent" variant="tonal">
          <div class="text-caption">{{ t('dashboard.mood') }}</div>
          <div class="text-h5 font-weight-bold">
            {{
              dash.today.summary.latestMood
                ? moodEmoji[dash.today.summary.latestMood.mood]
                : '—'
            }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card :to="'/sleep'" class="pa-4" color="primary" variant="tonal">
          <div class="text-caption">{{ t('dashboard.sleep') }}</div>
          <div class="text-h5 font-weight-bold">
            {{
              dash.today.summary.sleep?.durationMin
                ? `${Math.round((dash.today.summary.sleep.durationMin / 60) * 10) / 10}h`
                : '—'
            }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div>
      <div class="text-caption text-medium-emphasis text-uppercase mb-2">
        {{ t('dashboard.more') }}
      </div>
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          size="small"
          variant="tonal"
          label
        >
          {{ link.title }}
        </v-chip>
      </div>
    </div>

    <v-alert
      v-if="dash.insights[0]"
      type="success"
      variant="tonal"
      :title="t('dashboard.insight')"
    >
      {{ t(dash.insights[0].messageKey, dash.insights[0].params || {}) }}
    </v-alert>

    <v-card class="pa-5">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h6 font-weight-bold">{{ t('dashboard.timeline') }}</div>
        <v-btn variant="text" color="primary" size="small" to="/meals">
          + {{ t('dashboard.quickLog') }}
        </v-btn>
      </div>
      <v-timeline v-if="dash.timeline.length" density="compact" side="end">
        <v-timeline-item
          v-for="item in dash.timeline"
          :key="`${item.kind}-${item.id}`"
          size="x-small"
          dot-color="primary"
        >
          <template #opposite>
            <span class="text-caption text-medium-emphasis">{{ formatTime(item.at) }}</span>
          </template>
          <div class="text-body-2 font-weight-medium">{{ itemLabel(item) }}</div>
          <div v-if="item.detail" class="text-caption text-medium-emphasis">{{ item.detail }}</div>
        </v-timeline-item>
      </v-timeline>
      <p v-else class="text-body-2 text-medium-emphasis">{{ t('dashboard.emptyTimeline') }}</p>
    </v-card>

    <v-card class="pa-5">
      <div class="text-h6 font-weight-bold mb-3">{{ t('dashboard.habits') }}</div>
      <v-list v-if="dash.today.habits.length" class="bg-transparent pa-0">
        <v-list-item
          v-for="habit in dash.today.habits"
          :key="habit.id"
          :title="`${habit.icon} ${habit.name}`"
          class="mb-1 rounded-lg"
          style="background: rgba(0, 0, 0, 0.03)"
        >
          <template #append>
            <v-btn
              size="small"
              :color="habit.completedToday ? 'success' : undefined"
              :variant="habit.completedToday ? 'flat' : 'tonal'"
              @click="toggleHabit(habit)"
            >
              {{ habit.completedToday ? '✓' : '○' }}
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
      <p v-else class="text-body-2 text-medium-emphasis">{{ t('habits.empty') }}</p>
    </v-card>
  </div>
</template>
