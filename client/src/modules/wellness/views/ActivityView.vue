<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const logs = ref([])
const busy = ref(false)

const form = reactive({
  type: 'walk',
  effort: 'bit',
})

const types = ['walk', 'run', 'gym', 'yoga', 'bike', 'swim', 'other']

const efforts = [
  { key: 'bit', duration: 15, intensity: 'light', icon: '🚶' },
  { key: 'while', duration: 30, intensity: 'moderate', icon: '🙂' },
  { key: 'lot', duration: 60, intensity: 'intense', icon: '💪' },
]

async function load() {
  const data = await api('/activities')
  logs.value = data.logs
}

function effortLabel(duration) {
  if (duration <= 20) return t('activity.effort.bit')
  if (duration <= 40) return t('activity.effort.while')
  return t('activity.effort.lot')
}

async function save() {
  const effort = efforts.find((e) => e.key === form.effort) || efforts[1]
  busy.value = true
  try {
    await api('/activities', {
      method: 'POST',
      body: {
        type: form.type,
        duration: effort.duration,
        intensity: effort.intensity,
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
  <PageHeader :title="t('activity.title')" :subtitle="t('activity.subtitle')" icon="mdi-walk" />

  <v-card class="pa-4 pa-sm-5 mb-5 cx-panel--lift">
    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('activity.whatAsk') }}</p>
    <div class="d-flex flex-wrap ga-2 mb-5">
      <button
        v-for="type in types"
        :key="type"
        type="button"
        class="select-tile"
        :class="{ 'select-tile--on': form.type === type }"
        style="width: auto"
        @click="form.type = type"
      >
        {{ t(`activity.types.${type}`) }}
      </button>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('activity.howAsk') }}</p>
    <v-row dense class="mb-5">
      <v-col v-for="(e, i) in efforts" :key="e.key" cols="4">
        <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 60 + i * 50) }">
          <button
            type="button"
            class="select-tile select-tile--center"
            :class="{ 'select-tile--on': form.effort === e.key }"
            @click="form.effort = e.key"
          >
            <span class="select-tile__emoji" aria-hidden="true">{{ e.icon }}</span>
            <span class="text-truncate">{{ t(`activity.effort.${e.key}`) }}</span>
          </button>
        </div>
      </v-col>
    </v-row>

    <v-btn block color="primary" size="large" :loading="busy" @click="save">
      {{ t('activity.save') }}
    </v-btn>
  </v-card>

  <div v-for="log in logs" :key="log.id" class="cx-log">
    <div class="text-subtitle-2">{{ t(`activity.types.${log.type}`, log.type) }}</div>
    <div class="text-caption text-medium-emphasis">{{ effortLabel(log.duration) }}</div>
  </div>
</template>
