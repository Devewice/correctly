<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

const { t } = useI18n()
const logs = ref([])
const busy = ref(false)
const form = reactive({
  type: 'walk',
  duration: 30,
  intensity: 'moderate',
  notes: '',
})

const types = ['walk', 'run', 'gym', 'yoga', 'bike', 'swim', 'other']

async function load() {
  const data = await api('/activities')
  logs.value = data.logs
}

async function save() {
  busy.value = true
  try {
    await api('/activities', {
      method: 'POST',
      body: {
        type: form.type,
        duration: Number(form.duration),
        intensity: form.intensity,
        notes: form.notes || undefined,
      },
    })
    form.notes = ''
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader :title="t('activity.title')" />

  <v-card class="pa-5 mb-6">
    <v-form @submit.prevent="save">
      <div class="d-flex flex-wrap ga-2 mb-4">
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

      <v-text-field
        v-model.number="form.duration"
        type="number"
        :min="1"
        :max="600"
        :label="t('activity.duration')"
        class="mb-3"
      />

      <div class="d-flex flex-wrap ga-2 mb-4">
        <v-chip
          v-for="level in ['light', 'moderate', 'intense']"
          :key="level"
          :color="form.intensity === level ? 'secondary' : undefined"
          :variant="form.intensity === level ? 'flat' : 'tonal'"
          size="small"
          label
          @click="form.intensity = level"
        >
          {{ t(`activity.intensity.${level}`) }}
        </v-chip>
      </div>

      <v-text-field v-model="form.notes" :label="t('activity.notes')" class="mb-3" />

      <v-btn type="submit" block color="primary" size="large" :loading="busy">
        {{ t('activity.save') }}
      </v-btn>
    </v-form>
  </v-card>

  <v-card v-for="log in logs" :key="log.id" class="pa-4 mb-2">
    <div class="text-subtitle-2">
      {{ t(`activity.types.${log.type}`, log.type) }} · {{ log.duration }} min
    </div>
    <div class="text-caption text-medium-emphasis">
      {{ t(`activity.intensity.${log.intensity}`, log.intensity || '') }}
    </div>
  </v-card>
</template>
