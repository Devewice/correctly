<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

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
  <PageHeader :title="t('meals.title')" />

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
          {{ t(`meals.types.${type}`) }}
        </v-chip>
      </div>

      <v-text-field
        v-model="form.description"
        :label="t('meals.description')"
        required
        class="mb-2"
      />

      <v-row dense>
        <v-col cols="12" sm="6">
          <div class="text-body-2 mb-1">{{ t('meals.satisfaction') }}: {{ form.satisfaction }}</div>
          <v-slider v-model="form.satisfaction" :min="1" :max="5" :step="1" />
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-body-2 mb-1">{{ t('meals.quality') }}: {{ form.quality }}</div>
          <v-slider v-model="form.quality" :min="1" :max="5" :step="1" />
        </v-col>
      </v-row>

      <v-btn type="submit" block color="primary" size="large" :loading="busy" class="mt-2">
        {{ t('meals.save') }}
      </v-btn>
    </v-form>
  </v-card>

  <v-card v-for="meal in meals" :key="meal.id" class="pa-4 mb-2">
    <div class="text-subtitle-2">{{ t(`meals.types.${meal.type}`) }}</div>
    <div class="text-body-2 text-medium-emphasis">{{ meal.description }}</div>
    <div class="text-caption text-medium-emphasis mt-1">
      {{ new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
    </div>
  </v-card>
</template>
