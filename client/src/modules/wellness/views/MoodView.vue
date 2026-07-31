<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { fadeUp, moodHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const selected = ref(null)
const logs = ref([])
const busy = ref(false)

const moods = [
  { value: 1, emoji: '😢', key: 'awful' },
  { value: 2, emoji: '😕', key: 'low' },
  { value: 3, emoji: '😐', key: 'ok' },
  { value: 4, emoji: '🙂', key: 'good' },
  { value: 5, emoji: '😄', key: 'great' },
]

async function load() {
  const data = await api('/mood')
  logs.value = data.logs
}

async function save(value) {
  selected.value = value
  busy.value = true
  try {
    await api('/mood', { method: 'POST', body: { mood: value } })
    selected.value = null
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader :title="t('mood.title')" :subtitle="t('mood.subtitle')" />

  <p class="text-body-2 text-medium-emphasis mb-4">{{ t('mood.ask') }}</p>

  <v-row dense class="mb-6">
    <v-col v-for="(m, i) in moods" :key="m.value" cols="4" sm>
      <div v-motion v-bind="{ ...moodHover, ...withDelay(fadeUp, 50 + i * 40) }">
        <v-card
          class="pa-3 text-center"
          :color="selected === m.value ? 'secondary' : undefined"
          :variant="selected === m.value ? 'flat' : 'tonal'"
          :disabled="busy"
          @click="save(m.value)"
        >
          <div class="text-h4">{{ m.emoji }}</div>
          <div class="text-caption mt-1">{{ t(`mood.labels.${m.key}`) }}</div>
        </v-card>
      </div>
    </v-col>
  </v-row>

  <v-card v-for="log in logs.slice(0, 8)" :key="log.id" class="pa-4 mb-2">
    <div class="d-flex align-center justify-space-between">
      <span>
        <span class="text-h6 me-2">{{ moods.find((m) => m.value === log.mood)?.emoji }}</span>
        {{ t(`mood.labels.${moods.find((m) => m.value === log.mood)?.key || 'ok'}`) }}
      </span>
      <span class="text-caption text-medium-emphasis">
        {{ new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </span>
    </div>
  </v-card>
</template>
