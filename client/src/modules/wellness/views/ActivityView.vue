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
  <PageHeader :title="t('activity.title')" :subtitle="t('activity.subtitle')" />

  <v-card class="pa-5 mb-6">
    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('activity.whatAsk') }}</p>
    <div class="d-flex flex-wrap ga-2 mb-5">
      <v-chip
        v-for="type in types"
        :key="type"
        :color="form.type === type ? 'primary' : undefined"
        :variant="form.type === type ? 'flat' : 'tonal'"
        size="small"
        label
        @click="form.type = type"
      >
        {{ t(`activity.types.${type}`) }}
      </v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('activity.howAsk') }}</p>
    <v-row dense class="mb-5">
      <v-col v-for="(e, i) in efforts" :key="e.key" cols="4">
        <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 60 + i * 50) }">
          <v-card
            class="pa-3 text-center h-100"
            :color="form.effort === e.key ? 'secondary' : undefined"
            :variant="form.effort === e.key ? 'flat' : 'tonal'"
            @click="form.effort = e.key"
          >
            <div class="text-h5 mb-1">{{ e.icon }}</div>
            <div class="text-caption font-weight-medium text-truncate px-1">
              {{ t(`activity.effort.${e.key}`) }}
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <v-btn block color="primary" size="large" :loading="busy" @click="save">
      {{ t('activity.save') }}
    </v-btn>
  </v-card>

  <v-card v-for="log in logs" :key="log.id" class="pa-4 mb-2">
    <div class="text-subtitle-2">{{ t(`activity.types.${log.type}`, log.type) }}</div>
    <div class="text-caption text-medium-emphasis">{{ effortLabel(log.duration) }}</div>
  </v-card>
</template>
