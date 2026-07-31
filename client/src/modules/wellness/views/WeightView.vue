<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const logs = ref([])
const busy = ref(false)

const latest = computed(() => logs.value[0] || null)

/** Sin balanza mental: solo sensación relativa o un punto suave de partida */
const relative = [
  { key: 'lighter', delta: -0.4, icon: '🍃' },
  { key: 'same', delta: 0, icon: '🙂' },
  { key: 'heavier', delta: 0.4, icon: '🪨' },
]

const starters = [
  { key: 'soft', weight: 58, icon: '🌱' },
  { key: 'mid', weight: 72, icon: '🌿' },
  { key: 'strong', weight: 88, icon: '🌳' },
]

async function load() {
  const data = await api('/weight')
  logs.value = data.logs
}

async function saveRelative(opt) {
  if (!latest.value) return
  busy.value = true
  try {
    const next = Math.round((latest.value.weight + opt.delta) * 10) / 10
    await api('/weight', {
      method: 'POST',
      body: { weight: next, notes: t(`weight.feel.${opt.key}`) },
    })
    await load()
  } finally {
    busy.value = false
  }
}

async function saveStarter(opt) {
  busy.value = true
  try {
    await api('/weight', {
      method: 'POST',
      body: { weight: opt.weight, notes: t(`weight.start.${opt.key}`) },
    })
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader :title="t('weight.title')" :subtitle="t('weight.subtitle')" icon="mdi-scale-bathroom" />

  <template v-if="latest">
    <v-alert type="info" variant="tonal" class="mb-5">
      {{ t('weight.softLatest') }}
    </v-alert>

    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('weight.ask') }}</p>
    <v-row dense>
      <v-col v-for="(opt, i) in relative" :key="opt.key" cols="12" sm="4">
        <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 60 + i * 60) }">
          <v-card
            class="pa-5 text-center h-100"
            color="secondary"
            variant="tonal"
            :disabled="busy"
            @click="saveRelative(opt)"
          >
            <div class="text-h3 mb-2">{{ opt.icon }}</div>
            <div class="text-subtitle-1 font-weight-bold">{{ t(`weight.feel.${opt.key}`) }}</div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ t(`weight.feelHint.${opt.key}`) }}
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </template>

  <template v-else>
    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('weight.startAsk') }}</p>
    <v-row dense>
      <v-col v-for="(opt, i) in starters" :key="opt.key" cols="12" sm="4">
        <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 60 + i * 60) }">
          <v-card
            class="pa-5 text-center h-100"
            variant="tonal"
            :disabled="busy"
            @click="saveStarter(opt)"
          >
            <div class="text-h3 mb-2">{{ opt.icon }}</div>
            <div class="text-subtitle-1 font-weight-bold">{{ t(`weight.start.${opt.key}`) }}</div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ t(`weight.startHint.${opt.key}`) }}
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </template>
</template>
