<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

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
  <AppShell>
    <h1 class="mb-6 font-display text-3xl font-800">{{ t('mood.title') }}</h1>

    <div class="mb-6 flex justify-between gap-2">
      <button
        v-for="m in moods"
        :key="m.value"
        type="button"
        class="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition"
        :class="selected === m.value ? 'bg-blush scale-110 shadow-md' : 'bg-white/80 ring-1 ring-black/5'"
        @click="selected = m.value"
      >
        {{ m.emoji }}
      </button>
    </div>

    <button
      type="button"
      class="mb-8 w-full rounded-2xl bg-sage py-3 text-white disabled:opacity-40"
      :disabled="!selected || busy"
      @click="save"
    >
      {{ t('mood.save') }}
    </button>

    <ul class="space-y-2">
      <li
        v-for="log in logs"
        :key="log.id"
        class="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-black/5"
      >
        <span class="text-2xl">{{ moods.find((m) => m.value === log.mood)?.emoji }}</span>
        <span class="text-xs text-muted">
          {{ new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
        </span>
      </li>
    </ul>
  </AppShell>
</template>
