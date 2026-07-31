<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'

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
  <h1 class="text-h4 font-weight-bold mb-4">{{ t('sleep.title') }}</h1>

  <v-card class="pa-5 mb-6" color="accent" variant="tonal" tag="form" @submit.prevent="save">
    <v-text-field
      v-model="form.bedTime"
      type="datetime-local"
      :label="t('sleep.bed')"
      required
      class="mb-2"
    />
    <v-text-field
      v-model="form.wakeTime"
      type="datetime-local"
      :label="t('sleep.wake')"
      class="mb-2"
    />
    <div class="text-body-2 mb-1">{{ t('sleep.quality') }}: {{ form.quality }}</div>
    <v-slider v-model="form.quality" :min="1" :max="5" :step="1" color="primary" thumb-label class="mb-2" />
    <v-btn type="submit" block color="primary" size="large" :loading="busy">
      {{ t('sleep.save') }}
    </v-btn>
  </v-card>

  <v-card v-for="log in logs" :key="log.id" class="pa-4 mb-2">
    <div class="text-body-2">
      {{ new Date(log.bedTime).toLocaleString() }}
      <span v-if="log.wakeTime"> → {{ new Date(log.wakeTime).toLocaleString() }}</span>
    </div>
    <div class="text-caption text-medium-emphasis">
      {{ log.durationMin ? `${Math.round((log.durationMin / 60) * 10) / 10}h` : '—' }}
      · ★ {{ log.quality || '—' }}
    </div>
  </v-card>
</template>
