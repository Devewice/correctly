<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

const { t } = useI18n()
const logs = ref([])
const busy = ref(false)
const form = reactive({
  bedTime: '',
  wakeTime: '',
  quality: 4,
})

function toLocalInput(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

form.bedTime = toLocalInput(new Date(Date.now() - 8 * 3600000))
form.wakeTime = toLocalInput()

async function load() {
  const data = await api('/sleep')
  logs.value = data.logs
}

async function save() {
  busy.value = true
  try {
    await api('/sleep', {
      method: 'POST',
      body: {
        bedTime: new Date(form.bedTime).toISOString(),
        wakeTime: form.wakeTime ? new Date(form.wakeTime).toISOString() : null,
        quality: form.quality,
      },
    })
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppShell>
    <h1 class="mb-4 font-display text-3xl font-800">{{ t('sleep.title') }}</h1>

    <form class="mb-6 space-y-3 rounded-3xl bg-lavender/30 p-5 ring-1 ring-lavender/50" @submit.prevent="save">
      <label class="block text-sm">
        {{ t('sleep.bed') }}
        <input v-model="form.bedTime" type="datetime-local" class="mt-1 w-full rounded-xl bg-white px-3 py-2" required />
      </label>
      <label class="block text-sm">
        {{ t('sleep.wake') }}
        <input v-model="form.wakeTime" type="datetime-local" class="mt-1 w-full rounded-xl bg-white px-3 py-2" />
      </label>
      <label class="block text-sm">
        {{ t('sleep.quality') }}: {{ form.quality }}
        <input v-model.number="form.quality" type="range" min="1" max="5" class="w-full" />
      </label>
      <button type="submit" class="w-full rounded-2xl bg-sage py-3 text-white" :disabled="busy">
        {{ t('sleep.save') }}
      </button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="log in logs"
        :key="log.id"
        class="rounded-2xl bg-white/80 px-4 py-3 text-sm ring-1 ring-black/5"
      >
        <p>
          {{ new Date(log.bedTime).toLocaleString() }}
          <span v-if="log.wakeTime"> → {{ new Date(log.wakeTime).toLocaleString() }}</span>
        </p>
        <p class="text-muted">
          {{ log.durationMin ? `${Math.round(log.durationMin / 60 * 10) / 10}h` : '—' }}
          · ★ {{ log.quality || '—' }}
        </p>
      </li>
    </ul>
  </AppShell>
</template>
