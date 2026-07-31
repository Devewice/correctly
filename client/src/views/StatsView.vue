<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

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
</script>

<template>
  <AppShell>
    <h1 class="mb-2 font-display text-3xl font-extrabold">{{ t('stats.title') }}</h1>
    <p class="mb-6 text-sm text-muted">{{ t('stats.subtitle') }}</p>

    <div v-if="!data" class="text-muted">{{ t('common.loading') }}</div>

    <template v-else>
      <section class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div class="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5">
          <p class="text-xs text-muted">{{ t('stats.streak') }}</p>
          <p class="font-display text-2xl font-extrabold">{{ data.stats?.currentStreak || 0 }}</p>
        </div>
        <div class="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5">
          <p class="text-xs text-muted">XP</p>
          <p class="font-display text-2xl font-extrabold">{{ data.stats?.totalXP || 0 }}</p>
        </div>
        <div class="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5">
          <p class="text-xs text-muted">{{ t('stats.avgMood') }}</p>
          <p class="font-display text-2xl font-extrabold">{{ moodLabel(data.totals.avgMood) }}</p>
        </div>
        <div class="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5">
          <p class="text-xs text-muted">{{ t('stats.meditation') }}</p>
          <p class="font-display text-2xl font-extrabold">{{ data.totals.meditationMin }}m</p>
        </div>
      </section>

      <section class="mb-6 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5">
        <h2 class="mb-4 font-display text-xl font-bold">{{ t('stats.waterWeek') }}</h2>
        <div class="flex h-40 items-end gap-2">
          <div
            v-for="day in data.days"
            :key="day.date"
            class="flex flex-1 flex-col items-center gap-1"
          >
            <div class="flex h-28 w-full items-end rounded-t-lg bg-sand/80">
              <div
                class="w-full rounded-t-lg bg-sky transition-all"
                :style="{ height: `${Math.max(4, (day.waterMl / maxWater) * 100)}%` }"
              />
            </div>
            <span class="text-[10px] text-muted">{{ day.date.slice(5) }}</span>
          </div>
        </div>
      </section>

      <section class="mb-6 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5">
        <h2 class="mb-3 font-display text-xl font-bold">{{ t('stats.days') }}</h2>
        <ul class="space-y-2 text-sm">
          <li
            v-for="day in data.days"
            :key="day.date"
            class="grid grid-cols-4 gap-2 rounded-2xl bg-sand/50 px-3 py-2"
          >
            <span>{{ day.date.slice(5) }}</span>
            <span>{{ day.meals }} 🍽</span>
            <span>{{ Math.round(day.waterMl / 100) / 10 }}L</span>
            <span>{{ moodLabel(day.avgMood) }}</span>
          </li>
        </ul>
      </section>

      <section class="rounded-3xl bg-sage/10 p-5 ring-1 ring-sage/20">
        <h2 class="mb-3 font-display text-xl font-bold">{{ t('stats.badges') }}</h2>
        <ul v-if="achievements.length" class="flex flex-wrap gap-2">
          <li
            v-for="a in achievements"
            :key="a.id"
            class="rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-black/5"
          >
            {{ badgeLabel(a.badgeId) }}
          </li>
        </ul>
        <p v-else class="text-sm text-muted">{{ t('stats.noBadges') }}</p>
      </section>
    </template>
  </AppShell>
</template>
