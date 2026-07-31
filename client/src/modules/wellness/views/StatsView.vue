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
  <PageHeader :title="t('stats.title')" :subtitle="t('stats.subtitle')" />

  <div v-if="!data" class="text-medium-emphasis">{{ t('common.loading') }}</div>

  <template v-else>
    <v-row dense class="mb-4">
      <v-col cols="6" md="3">
        <v-card class="pa-4">
          <div class="text-caption text-medium-emphasis">{{ t('stats.streak') }}</div>
          <div class="text-h5 font-weight-bold">{{ data.stats?.currentStreak || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4">
          <div class="text-caption text-medium-emphasis">XP</div>
          <div class="text-h5 font-weight-bold">{{ data.stats?.totalXP || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4">
          <div class="text-caption text-medium-emphasis">{{ t('stats.avgMood') }}</div>
          <div class="text-h5 font-weight-bold">{{ moodLabel(data.totals.avgMood) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4">
          <div class="text-caption text-medium-emphasis">{{ t('stats.meditation') }}</div>
          <div class="text-h5 font-weight-bold">{{ data.totals.meditationMin }}m</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4">
          <div class="text-caption text-medium-emphasis">{{ t('stats.likes') }}</div>
          <div class="text-h5 font-weight-bold">{{ data.stats?.likesReceived || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="pa-4">
          <div class="text-caption text-medium-emphasis">{{ t('stats.dislikes') }}</div>
          <div class="text-h5 font-weight-bold">{{ data.stats?.dislikesReceived || 0 }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="pa-5 mb-4">
      <div class="text-h6 font-weight-bold mb-4">{{ t('stats.waterWeek') }}</div>
      <div class="d-flex align-end ga-2" style="height: 140px">
        <div
          v-for="day in data.days"
          :key="day.date"
          class="d-flex flex-column align-center flex-grow-1 h-100"
        >
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
            {{ glassesFromMl(day.waterMl) }} · {{ day.date.slice(5) }}
          </span>
        </div>
      </div>
    </v-card>

    <v-card class="pa-5 mb-4">
      <div class="text-h6 font-weight-bold mb-3">{{ t('stats.days') }}</div>
      <v-list density="compact">
        <v-list-item
          v-for="day in data.days"
          :key="day.date"
          class="mb-1"
          rounded="lg"
          color="surface-light"
          variant="tonal"
        >
          <template #title>
            <div class="d-flex justify-space-between text-body-2">
              <span>{{ day.date.slice(5) }}</span>
              <span>{{ day.meals }} 🍽</span>
              <span>{{ Math.round(day.waterMl / 100) / 10 }}L</span>
              <span>{{ moodLabel(day.avgMood) }}</span>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="pa-5" color="primary" variant="tonal">
      <div class="text-h6 font-weight-bold mb-3">{{ t('stats.badges') }}</div>
      <div v-if="achievements.length" class="d-flex flex-wrap ga-2">
        <v-chip v-for="a in achievements" :key="a.id" size="small" label>
          {{ badgeLabel(a.badgeId) }}
        </v-chip>
      </div>
      <p v-else class="text-body-2 text-medium-emphasis">{{ t('stats.noBadges') }}</p>
    </v-card>
  </template>
</template>
