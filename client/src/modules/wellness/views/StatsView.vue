<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { glassesFromMl } from '@/shared/utils/water'

const { t } = useI18n()
const data = ref(null)
const achievements = ref([])

const maxWater = computed(() =>
  Math.max(2000, ...(data.value?.days.map((d) => d.waterMl) || [0])),
)

onMounted(async () => {
  const [weekly, ach] = await Promise.all([
    api('/dashboard/weekly'),
    api('/user/achievements'),
  ])
  data.value = weekly
  achievements.value = ach.achievements.filter((a) => !a.badgeId.startsWith('day_bonus_'))
})

function moodLabel(v) {
  if (v == null) return '—'
  return ['', '😢', '😕', '😐', '🙂', '😄'][Math.round(v)] || '—'
}

function badgeLabel(id) {
  return t(`badges.${id}`, id)
}

function barHeight(ml) {
  return `${Math.max(8, (ml / maxWater.value) * 100)}%`
}
</script>

<template>
  <PageHeader :title="t('stats.title')" :subtitle="t('stats.subtitle')" icon="mdi-chart-bar" />

  <div v-if="!data" class="text-medium-emphasis">{{ t('common.loading') }}</div>

  <template v-else>
    <v-row dense class="mb-2 align-stretch">
      <v-col cols="6" sm="4" md="3">
        <v-card class="pa-3 pa-sm-4 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('stats.streak') }}</div>
          <div class="cx-stat-card__value">{{ data.stats?.currentStreak || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card class="pa-3 pa-sm-4 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('stats.freeze') }}</div>
          <div class="cx-stat-card__value">{{ data.stats?.streakFreezesRemaining ?? 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card class="pa-3 pa-sm-4 cx-stat-card">
          <div class="cx-stat-card__label">XP</div>
          <div class="cx-stat-card__value">{{ data.stats?.totalXP || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card class="pa-3 pa-sm-4 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('stats.avgMood') }}</div>
          <div class="cx-stat-card__value">{{ moodLabel(data.totals.avgMood) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card class="pa-3 pa-sm-4 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('stats.meditation') }}</div>
          <div class="cx-stat-card__value">{{ data.totals.meditationMin }}m</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card class="pa-3 pa-sm-4 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('stats.likes') }}</div>
          <div class="cx-stat-card__value">{{ data.stats?.likesReceived || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="3">
        <v-card class="pa-3 pa-sm-4 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('stats.dislikes') }}</div>
          <div class="cx-stat-card__value">{{ data.stats?.dislikesReceived || 0 }}</div>
        </v-card>
      </v-col>
    </v-row>
    <p class="text-caption text-medium-emphasis mb-4">{{ t('stats.freezeHint') }}</p>

    <section class="cx-section">
      <p class="cx-section-label">{{ t('stats.correlations') }}</p>
      <div class="cx-panel">
        <template v-if="data.correlations?.length">
          <p
            v-for="c in data.correlations"
            :key="c.id"
            class="text-body-2 mb-2"
          >
            {{ t(c.messageKey, c.params || {}) }}
          </p>
        </template>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">
          {{ t('stats.correlationsEmpty') }}
        </p>
      </div>
    </section>

    <section class="cx-section">
      <p class="cx-section-label">{{ t('stats.waterWeek') }}</p>
      <v-card class="pa-4 pa-sm-5" variant="flat" color="surface-light">
      <div class="d-flex align-end ga-1 ga-sm-2" style="height: 140px">
        <div
          v-for="day in data.days"
          :key="day.date"
          class="d-flex flex-column align-center flex-grow-1 h-100"
          style="min-width: 0"
        >
          <div class="text-caption text-medium-emphasis mb-1">
            {{ glassesFromMl(day.waterMl) }}
          </div>
          <v-sheet
            color="surface-light"
            class="w-100 d-flex align-end flex-grow-1 rounded-t-lg"
            height="100%"
          >
            <v-sheet
              color="info"
              class="w-100 rounded-t-lg"
              :height="barHeight(day.waterMl)"
            />
          </v-sheet>
          <span class="text-caption text-medium-emphasis mt-1">
            {{ day.date.slice(8) }}
          </span>
        </div>
      </div>
      </v-card>
    </section>

    <section class="cx-section">
      <p class="cx-section-label">{{ t('stats.days') }}</p>
      <v-list density="compact">
        <v-list-item v-for="day in data.days" :key="day.date">
          <template #title>
            <div class="d-flex flex-wrap align-center justify-space-between ga-2 text-body-2">
              <span class="font-weight-medium">{{ day.date.slice(5) }}</span>
              <div class="d-flex flex-wrap ga-3 text-medium-emphasis">
                <span>{{ day.meals }} 🍽</span>
                <span>{{ glassesFromMl(day.waterMl) }} 💧</span>
                <span>{{ moodLabel(day.avgMood) }}</span>
              </div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </section>

    <section class="cx-section">
      <p class="cx-section-label">{{ t('stats.badges') }}</p>
      <div class="cx-panel">
        <div v-if="achievements.length" class="d-flex flex-wrap ga-2">
          <v-chip v-for="a in achievements" :key="a.id" size="small">
            {{ badgeLabel(a.badgeId) }}
          </v-chip>
        </div>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">{{ t('stats.noBadges') }}</p>
      </div>
    </section>
  </template>
</template>
