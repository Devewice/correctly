<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

const { t } = useI18n()
const logs = ref([])
const busy = ref(false)
const form = reactive({ weight: null, notes: '' })

const latest = computed(() => logs.value[0] || null)
const delta = computed(() => {
  if (logs.value.length < 2) return null
  return Math.round((logs.value[0].weight - logs.value[1].weight) * 10) / 10
})

async function load() {
  const data = await api('/weight')
  logs.value = data.logs
  if (latest.value) form.weight = latest.value.weight
}

async function save() {
  if (!form.weight) return
  busy.value = true
  try {
    await api('/weight', {
      method: 'POST',
      body: { weight: Number(form.weight), notes: form.notes || undefined },
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
  <PageHeader :title="t('weight.title')" :subtitle="t('weight.subtitle')" />

  <v-card v-if="latest" class="pa-5 mb-6" color="secondary" variant="tonal">
    <div class="text-caption text-medium-emphasis">{{ t('weight.latest') }}</div>
    <div class="text-h3 font-weight-bold">
      {{ latest.weight }} <span class="text-h6">kg</span>
    </div>
    <div
      v-if="delta !== null"
      class="text-body-2 mt-1"
      :class="delta <= 0 ? 'text-success' : 'text-medium-emphasis'"
    >
      {{ delta > 0 ? '+' : '' }}{{ delta }} kg
    </div>
  </v-card>

  <v-card class="pa-5 mb-6">
    <v-form @submit.prevent="save">
      <v-text-field
        v-model.number="form.weight"
        type="number"
        step="0.1"
        :min="20"
        :max="400"
        :label="t('weight.value')"
        required
        class="mb-2"
      />
      <v-text-field v-model="form.notes" :label="t('weight.notes')" class="mb-3" />
      <v-btn type="submit" block color="primary" size="large" :loading="busy">
        {{ t('weight.save') }}
      </v-btn>
    </v-form>
  </v-card>

  <v-card v-for="log in logs" :key="log.id" class="pa-4 mb-2">
    <div class="d-flex justify-space-between align-center">
      <span class="font-weight-medium">{{ log.weight }} kg</span>
      <span class="text-caption text-medium-emphasis">
        {{ new Date(log.loggedAt).toLocaleDateString() }}
      </span>
    </div>
  </v-card>
</template>
