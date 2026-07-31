<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()

/** Duraciones amigables → minutos aproximados por detrás */
const presets = [
  { key: 'short', min: 5 },
  { key: 'medium', min: 10 },
  { key: 'long', min: 15 },
  { key: 'deep', min: 20 },
]

const selectedKey = ref('short')
const type = ref('breathing')
const running = ref(false)
const remaining = ref(0)
const totalMin = ref(0)
const logs = ref([])
const phase = ref('inhale')
let timer = null
let phaseTimer = null

const selectedMin = computed(() => presets.find((p) => p.key === selectedKey.value)?.min || 5)

const progress = computed(() => {
  const total = selectedMin.value * 60
  if (!total) return 0
  return Math.round(((total - remaining.value) / total) * 100)
})

const phaseLabel = computed(() => (running.value ? t(`meditation.${phase.value}`) : t('meditation.start')))

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
  remaining.value = selectedMin.value * 60
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
        body: { duration: selectedMin.value, type: type.value, feeling: 'calmer' },
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

  <p class="text-body-2 text-medium-emphasis mb-3">{{ t('meditation.ask') }}</p>

  <v-row dense class="mb-4">
    <v-col v-for="(p, i) in presets" :key="p.key" cols="6" sm="3">
      <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 60 + i * 50) }">
        <v-card
          class="pa-4 text-center"
          :color="selectedKey === p.key ? 'accent' : undefined"
          :variant="selectedKey === p.key ? 'flat' : 'tonal'"
          :disabled="running"
          @click="selectedKey = p.key"
        >
          <div class="text-subtitle-2 font-weight-bold">{{ t(`meditation.durations.${p.key}`) }}</div>
        </v-card>
      </div>
    </v-col>
  </v-row>

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
      <div class="text-center px-2">
        <div class="text-h6 font-weight-bold">{{ phaseLabel }}</div>
      </div>
    </v-avatar>
  </div>

  <v-progress-linear v-if="running" :model-value="progress" color="accent" class="mb-6" />

  <v-btn v-if="!running" block color="primary" size="large" class="mb-6" @click="start">
    {{ t('meditation.start') }}
  </v-btn>
  <v-btn v-else block color="error" size="large" class="mb-6" @click="stop">
    {{ t('meditation.stop') }}
  </v-btn>

  <p v-if="totalMin > 0" class="text-body-2 text-medium-emphasis mb-3">{{ t('meditation.today') }}</p>
  <v-card v-for="log in logs.slice(0, 5)" :key="log.id" class="pa-4 mb-2">
    {{ t(`meditation.types.${log.type}`) }}
  </v-card>
</template>
