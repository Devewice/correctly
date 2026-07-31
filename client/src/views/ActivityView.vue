<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

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
  <AppShell>
    <h1 class="mb-4 font-display text-3xl font-extrabold">{{ t('activity.title') }}</h1>

    <form class="mb-6 space-y-3 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5" @submit.prevent="save">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in types"
          :key="type"
          type="button"
          class="rounded-full px-3 py-1.5 text-xs"
          :class="form.type === type ? 'bg-sage text-white' : 'bg-sand text-muted'"
          @click="form.type = type"
        >
          {{ t(`activity.types.${type}`) }}
        </button>
      </div>
      <label class="block text-sm">
        {{ t('activity.duration') }}
        <input v-model.number="form.duration" type="number" min="1" max="600" class="mt-1 w-full rounded-xl bg-sand px-3 py-2" />
      </label>
      <div class="flex gap-2">
        <button
          v-for="level in ['light', 'moderate', 'intense']"
          :key="level"
          type="button"
          class="rounded-full px-3 py-1.5 text-xs"
          :class="form.intensity === level ? 'bg-peach text-ink' : 'bg-sand text-muted'"
          @click="form.intensity = level"
        >
          {{ t(`activity.intensity.${level}`) }}
        </button>
      </div>
      <input
        v-model="form.notes"
        type="text"
        :placeholder="t('activity.notes')"
        class="w-full rounded-xl bg-sand px-3 py-2 text-sm"
      />
      <button type="submit" class="w-full rounded-2xl bg-sage py-3 text-white" :disabled="busy">
        {{ t('activity.save') }}
      </button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="log in logs"
        :key="log.id"
        class="rounded-2xl bg-white/80 px-4 py-3 text-sm ring-1 ring-black/5"
      >
        <p class="font-medium">{{ t(`activity.types.${log.type}`, log.type) }} · {{ log.duration }} min</p>
        <p class="text-xs text-muted">{{ t(`activity.intensity.${log.intensity}`, log.intensity || '') }}</p>
      </li>
    </ul>
  </AppShell>
</template>
