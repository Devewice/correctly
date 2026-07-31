<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const logs = ref([])
const busy = ref(false)

/** Opciones amigables → el API recibe horas aproximadas */
const options = [
  { key: 'great', quality: 5, hours: 8, icon: '😴' },
  { key: 'ok', quality: 3, hours: 6.5, icon: '😐' },
  { key: 'rough', quality: 2, hours: 5, icon: '😩' },
]

async function load() {
  const data = await api('/sleep')
  logs.value = data.logs
}

function feelLabel(quality) {
  if (quality >= 5) return t('sleep.feel.great')
  if (quality >= 3) return t('sleep.feel.ok')
  return t('sleep.feel.rough')
}

async function save(opt) {
  busy.value = true
  try {
    const wake = new Date()
    // Si es de tarde/noche, asumimos despertar a las 7 de hoy
    if (wake.getHours() >= 14) {
      wake.setHours(7, 0, 0, 0)
    }
    const bed = new Date(wake.getTime() - opt.hours * 3600000)
    await api('/sleep', {
      method: 'POST',
      body: {
        bedTime: bed.toISOString(),
        wakeTime: wake.toISOString(),
        quality: opt.quality,
      },
    })
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)

const latest = computed(() => logs.value[0] || null)
</script>

<template>
  <PageHeader :title="t('sleep.title')" :subtitle="t('sleep.subtitle')" />

  <p class="text-body-2 text-medium-emphasis mb-4">{{ t('sleep.ask') }}</p>

  <v-row dense class="mb-6">
    <v-col v-for="(opt, i) in options" :key="opt.key" cols="12" sm="4">
      <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 80 + i * 70) }">
        <v-card
          class="pa-5 text-center h-100"
          color="accent"
          variant="tonal"
          :disabled="busy"
          @click="save(opt)"
        >
          <div class="text-h3 mb-2">{{ opt.icon }}</div>
          <div class="text-subtitle-1 font-weight-bold">{{ t(`sleep.feel.${opt.key}`) }}</div>
          <div class="text-caption text-medium-emphasis mt-1">{{ t(`sleep.feelHint.${opt.key}`) }}</div>
        </v-card>
      </div>
    </v-col>
  </v-row>

  <v-alert v-if="latest" type="info" variant="tonal" class="mb-4">
    {{ t('sleep.last', { feel: feelLabel(latest.quality) }) }}
  </v-alert>

  <div v-for="log in logs.slice(0, 5)" :key="log.id" class="cx-log">
    <div class="font-weight-medium">{{ feelLabel(log.quality) }}</div>
    <div class="text-caption text-medium-emphasis">
      {{ new Date(log.bedTime).toLocaleDateString() }}
    </div>
  </div>
</template>
