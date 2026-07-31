<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

const { t } = useI18n()
const meals = ref([])
const busy = ref(false)
const form = reactive({
  type: 'breakfast',
  description: '',
  satisfaction: 3,
  quality: 4,
})

const types = ['breakfast', 'mid_morning', 'lunch', 'snack', 'dinner', 'night_snack']

async function load() {
  const data = await api('/meals')
  meals.value = data.meals
}

async function save() {
  busy.value = true
  try {
    await api('/meals', { method: 'POST', body: { ...form } })
    form.description = ''
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppShell>
    <h1 class="mb-4 font-display text-3xl font-800">{{ t('meals.title') }}</h1>

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
          {{ t(`meals.types.${type}`) }}
        </button>
      </div>
      <input
        v-model="form.description"
        type="text"
        :placeholder="t('meals.description')"
        class="w-full rounded-2xl bg-sand px-4 py-3 text-sm outline-none ring-sage/30 focus:ring-2"
        required
      />
      <div class="grid grid-cols-2 gap-3 text-sm">
        <label>
          {{ t('meals.satisfaction') }}: {{ form.satisfaction }}
          <input v-model.number="form.satisfaction" type="range" min="1" max="5" class="w-full" />
        </label>
        <label>
          {{ t('meals.quality') }}: {{ form.quality }}
          <input v-model.number="form.quality" type="range" min="1" max="5" class="w-full" />
        </label>
      </div>
      <button
        type="submit"
        class="w-full rounded-2xl bg-sage py-3 text-sm font-medium text-white disabled:opacity-50"
        :disabled="busy"
      >
        {{ t('meals.save') }}
      </button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="meal in meals"
        :key="meal.id"
        class="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-black/5"
      >
        <p class="text-sm font-medium">{{ t(`meals.types.${meal.type}`) }}</p>
        <p class="text-sm text-muted">{{ meal.description }}</p>
        <p class="mt-1 text-xs text-muted">
          {{ new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </li>
    </ul>
  </AppShell>
</template>
