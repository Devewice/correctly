<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

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
  <PageHeader :title="t('habits.title')" />

  <v-card v-if="habits.length">
    <v-list>
      <v-list-item
        v-for="habit in habits"
        :key="habit.id"
        :title="`${habit.icon} ${habit.name}`"
      >
        <template #append>
          <v-btn
            :icon="habit.completedToday ? 'mdi-check' : 'mdi-plus'"
            :color="habit.completedToday ? 'success' : undefined"
            :variant="habit.completedToday ? 'flat' : 'tonal'"
            @click="toggle(habit)"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-card>
  <v-alert v-else type="info" variant="tonal">{{ t('habits.empty') }}</v-alert>
</template>
