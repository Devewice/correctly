<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

const { t } = useI18n()
const selected = ref(null)
const logs = ref([])
const busy = ref(false)
const moods = [
  { value: 1, emoji: '😢' },
  { value: 2, emoji: '😕' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😄' },
]

async function load() {
  const data = await api('/mood')
  logs.value = data.logs
}

async function save() {
  if (!selected.value) return
  busy.value = true
  try {
    await api('/mood', { method: 'POST', body: { mood: selected.value } })
    selected.value = null
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader :title="t('mood.title')" />

  <div class="d-flex justify-space-between ga-2 mb-6">
    <v-btn
      v-for="m in moods"
      :key="m.value"
      :color="selected === m.value ? 'secondary' : undefined"
      :variant="selected === m.value ? 'flat' : 'tonal'"
      size="x-large"
      class="text-h4"
      @click="selected = m.value"
    >
      {{ m.emoji }}
    </v-btn>
  </div>

  <v-btn
    block
    color="primary"
    size="large"
    class="mb-8"
    :disabled="!selected"
    :loading="busy"
    @click="save"
  >
    {{ t('mood.save') }}
  </v-btn>

  <v-card v-for="log in logs" :key="log.id" class="pa-4 mb-2">
    <div class="d-flex align-center justify-space-between">
      <span class="text-h5">{{ moods.find((m) => m.value === log.mood)?.emoji }}</span>
      <span class="text-caption text-medium-emphasis">
        {{ new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </span>
    </div>
  </v-card>
</template>
