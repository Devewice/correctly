<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

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
  <AppShell>
    <h1 class="mb-2 font-display text-3xl font-extrabold">{{ t('meditation.title') }}</h1>
    <p class="mb-6 text-sm text-muted">{{ t('meditation.subtitle') }}</p>

    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="m in presets"
        :key="m"
        type="button"
        class="rounded-full px-4 py-2 text-sm"
        :class="selected === m ? 'bg-lavender text-ink' : 'bg-white/80 ring-1 ring-black/5 text-muted'"
        :disabled="running"
        @click="selected = m"
      >
        {{ m }} min
      </button>
    </div>

    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="opt in ['breathing', 'free', 'body_scan', 'gratitude']"
        :key="opt"
        type="button"
        class="rounded-full px-3 py-1.5 text-xs"
        :class="type === opt ? 'bg-sage text-white' : 'bg-sand text-muted'"
        :disabled="running"
        @click="type = opt"
      >
        {{ t(`meditation.types.${opt}`) }}
      </button>
    </div>

    <div class="mx-auto mb-6 flex h-52 w-52 items-center justify-center">
      <div
        class="flex h-40 w-40 items-center justify-center rounded-full bg-lavender/50 text-center shadow-inner transition-transform duration-1000"
        :class="running && phase === 'inhale' ? 'scale-110' : 'scale-90'"
      >
        <div>
          <p class="font-display text-3xl font-extrabold text-sage-dark">
            {{ running ? Math.ceil(remaining / 60) + ':' + String(remaining % 60).padStart(2, '0') : selected + ':00' }}
          </p>
          <p v-if="running" class="mt-1 text-xs uppercase tracking-wide text-muted">
            {{ t(`meditation.${phase}`) }}
          </p>
        </div>
      </div>
    </div>

    <div class="mb-2 h-2 overflow-hidden rounded-full bg-sand">
      <div class="h-full bg-lavender transition-all" :style="{ width: `${progress}%` }" />
    </div>

    <div class="mb-8 flex gap-3">
      <button
        v-if="!running"
        type="button"
        class="flex-1 rounded-2xl bg-sage py-3 text-white"
        @click="start"
      >
        {{ t('meditation.start') }}
      </button>
      <button
        v-else
        type="button"
        class="flex-1 rounded-2xl bg-danger/80 py-3 text-white"
        @click="stop"
      >
        {{ t('meditation.stop') }}
      </button>
    </div>

    <p class="mb-3 text-sm text-muted">{{ t('meditation.today', { min: totalMin }) }}</p>
    <ul class="space-y-2">
      <li
        v-for="log in logs"
        :key="log.id"
        class="rounded-2xl bg-white/80 px-4 py-3 text-sm ring-1 ring-black/5"
      >
        {{ log.duration }} min · {{ t(`meditation.types.${log.type}`) }}
      </li>
    </ul>
  </AppShell>
</template>
