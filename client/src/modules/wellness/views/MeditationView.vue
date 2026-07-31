<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

const { t } = useI18n()
const presets = [5, 10, 15, 20]
const selected = ref(5)
const type = ref('breathing')
const running = ref(false)
const remaining = ref(0)
const totalMin = ref(0)
const logs = ref([])
const phase = ref('inhale')
let timer = null
let phaseTimer = null

const progress = computed(() => {
  const total = selected.value * 60
  if (!total) return 0
  return Math.round(((total - remaining.value) / total) * 100)
})

const clock = computed(() => {
  if (!running.value) return `${selected.value}:00`
  const m = Math.floor(remaining.value / 60)
  const s = String(remaining.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

async function load() {
  const data = await api('/meditation')
  totalMin.value = data.totalMin
  logs.value = data.logs
}

function startPhaseCycle() {
  clearInterval(phaseTimer)
  phase.value = 'inhale'
  let tick = 0
  phaseTimer = setInterval(() => {
    tick += 1
    const cycle = tick % 8
    phase.value = cycle < 4 ? 'inhale' : 'exhale'
  }, 1000)
}

function start() {
  remaining.value = selected.value * 60
  running.value = true
  startPhaseCycle()
  clearInterval(timer)
  timer = setInterval(async () => {
    remaining.value -= 1
    if (remaining.value <= 0) {
      clearInterval(timer)
      clearInterval(phaseTimer)
      running.value = false
      await api('/meditation', {
        method: 'POST',
        body: { duration: selected.value, type: type.value, feeling: 'calmer' },
      })
      await load()
    }
  }, 1000)
}

function stop() {
  clearInterval(timer)
  clearInterval(phaseTimer)
  running.value = false
  remaining.value = 0
}

onMounted(load)
onUnmounted(stop)
</script>

<template>
  <PageHeader :title="t('meditation.title')" :subtitle="t('meditation.subtitle')" />

  <div class="d-flex flex-wrap ga-2 mb-4">
    <v-chip
      v-for="m in presets"
      :key="m"
      :color="selected === m ? 'accent' : undefined"
      :variant="selected === m ? 'flat' : 'tonal'"
      :disabled="running"
      label
      @click="selected = m"
    >
      {{ m }} min
    </v-chip>
  </div>

  <div class="d-flex flex-wrap ga-2 mb-6">
    <v-chip
      v-for="opt in ['breathing', 'free', 'body_scan', 'gratitude']"
      :key="opt"
      :color="type === opt ? 'primary' : undefined"
      :variant="type === opt ? 'flat' : 'tonal'"
      :disabled="running"
      size="small"
      label
      @click="type = opt"
    >
      {{ t(`meditation.types.${opt}`) }}
    </v-chip>
  </div>

  <div class="d-flex justify-center mb-4">
    <v-avatar
      color="accent"
      size="180"
      :style="{
        transform: running && phase === 'inhale' ? 'scale(1.08)' : 'scale(0.92)',
        transition: 'transform 1s ease',
      }"
    >
      <div class="text-center">
        <div class="text-h4 font-weight-bold">{{ clock }}</div>
        <div v-if="running" class="text-caption text-medium-emphasis text-uppercase">
          {{ t(`meditation.${phase}`) }}
        </div>
      </div>
    </v-avatar>
  </div>

  <v-progress-linear :model-value="progress" color="accent" class="mb-6" />

  <v-btn v-if="!running" block color="primary" size="large" class="mb-6" @click="start">
    {{ t('meditation.start') }}
  </v-btn>
  <v-btn v-else block color="error" size="large" class="mb-6" @click="stop">
    {{ t('meditation.stop') }}
  </v-btn>

  <p class="text-body-2 text-medium-emphasis mb-3">{{ t('meditation.today', { min: totalMin }) }}</p>
  <v-card v-for="log in logs" :key="log.id" class="pa-4 mb-2">
    {{ log.duration }} min · {{ t(`meditation.types.${log.type}`) }}
  </v-card>
</template>
