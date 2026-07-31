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
        <button
          type="button"
          class="mood-tile"
          :class="{ 'mood-tile--selected': selected === m.value }"
          :disabled="busy"
          @click="save(m.value)"
        >
          <span class="mood-tile__emoji" aria-hidden="true">{{ m.emoji }}</span>
          <span class="mood-tile__label">{{ t(`mood.labels.${m.key}`) }}</span>
        </button>
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

<style scoped>
.mood-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  min-height: 5.5rem;
  padding: 0.75rem 0.4rem;
  border: 2px solid #e4d9cb;
  border-radius: 1rem;
  background: #f5ede3;
  color: #3d3d3d;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.mood-tile:hover:not(:disabled) {
  border-color: #8ba888;
  background: #eef3ed;
}

.mood-tile--selected {
  border-color: #8ba888;
  background: #f4cba8;
  box-shadow: 0 0 0 1px #8ba888;
}

.mood-tile:disabled {
  opacity: 0.6;
  cursor: default;
}

.mood-tile__emoji {
  font-size: 2rem;
  line-height: 1.1;
}

.mood-tile__label {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  color: #3d3d3d;
  text-align: center;
}

@media (min-width: 600px) {
  .mood-tile {
    min-height: 6.25rem;
  }

  .mood-tile__emoji {
    font-size: 2.35rem;
  }
}
</style>
