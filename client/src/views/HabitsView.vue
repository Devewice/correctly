<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

const { t } = useI18n()
const habits = ref([])
const date = ref('')

async function load() {
  const data = await api('/habits')
  habits.value = data.habits
  date.value = data.date
}

async function toggle(habit) {
  if (habit.completedToday) {
    await api(`/habits/${habit.id}/complete?date=${date.value}`, { method: 'DELETE' })
  } else {
    await api(`/habits/${habit.id}/complete`, {
      method: 'POST',
      body: { date: date.value },
    })
  }
  await load()
}

onMounted(load)
</script>

<template>
  <AppShell>
    <h1 class="mb-4 font-display text-3xl font-800">{{ t('habits.title') }}</h1>

    <ul v-if="habits.length" class="space-y-2">
      <li
        v-for="habit in habits"
        :key="habit.id"
        class="flex items-center justify-between rounded-3xl bg-white/80 px-4 py-4 ring-1 ring-black/5"
      >
        <span class="text-lg">{{ habit.icon }} {{ habit.name }}</span>
        <button
          type="button"
          class="h-10 w-10 rounded-full text-lg"
          :class="habit.completedToday ? 'bg-success text-white' : 'bg-sand text-muted'"
          @click="toggle(habit)"
        >
          {{ habit.completedToday ? '✓' : '+' }}
        </button>
      </li>
    </ul>
    <p v-else class="text-muted">{{ t('habits.empty') }}</p>
  </AppShell>
</template>
