<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const meals = ref([])
const busy = ref(false)

const form = reactive({
  type: 'breakfast',
  description: '',
  feel: 'good',
})

const types = ['breakfast', 'mid_morning', 'lunch', 'snack', 'dinner', 'night_snack']

const feels = [
  { key: 'yummy', satisfaction: 5, quality: 5, icon: '😋' },
  { key: 'good', satisfaction: 3, quality: 4, icon: '🙂' },
  { key: 'heavy', satisfaction: 2, quality: 2, icon: '😣' },
]

function suggestType() {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 18) return 'snack'
  if (h < 22) return 'dinner'
  return 'night_snack'
}

form.type = suggestType()

async function load() {
  const data = await api('/meals')
  meals.value = data.meals
}

async function save() {
  const feel = feels.find((f) => f.key === form.feel) || feels[1]
  busy.value = true
  try {
    await api('/meals', {
      method: 'POST',
      body: {
        type: form.type,
        description: form.description.trim() || t(`meals.types.${form.type}`),
        satisfaction: feel.satisfaction,
        quality: feel.quality,
      },
    })
    form.description = ''
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader :title="t('meals.title')" :subtitle="t('meals.subtitle')" />

  <v-card class="pa-5 mb-6">
    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('meals.whenAsk') }}</p>
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
        {{ t(`meals.types.${type}`) }}
      </v-chip>
    </div>

    <v-text-field
      v-model="form.description"
      :label="t('meals.description')"
      :placeholder="t('meals.placeholder')"
      class="mb-5"
    />

    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('meals.feelAsk') }}</p>
    <v-row dense class="mb-5">
      <v-col v-for="(f, i) in feels" :key="f.key" cols="4">
        <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 60 + i * 50) }">
          <v-card
            class="pa-3 text-center"
            :color="form.feel === f.key ? 'secondary' : undefined"
            :variant="form.feel === f.key ? 'flat' : 'tonal'"
            @click="form.feel = f.key"
          >
            <div class="text-h5">{{ f.icon }}</div>
            <div class="text-caption font-weight-medium">{{ t(`meals.feel.${f.key}`) }}</div>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <v-btn block color="primary" size="large" :loading="busy" @click="save">
      {{ t('meals.save') }}
    </v-btn>
  </v-card>

  <v-card v-for="meal in meals" :key="meal.id" class="pa-4 mb-2">
    <div class="text-subtitle-2">{{ t(`meals.types.${meal.type}`) }}</div>
    <div class="text-body-2 text-medium-emphasis">{{ meal.description }}</div>
  </v-card>
</template>
