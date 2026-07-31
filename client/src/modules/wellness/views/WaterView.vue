<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

const { t } = useI18n()
const totalMl = ref(0)
const goal = 2000
const busy = ref(false)

const pct = computed(() => Math.min(100, Math.round((totalMl.value / goal) * 100)))

async function load() {
  const data = await api('/water')
  totalMl.value = data.totalMl
}

async function add(amount) {
  busy.value = true
  try {
    await api('/water', { method: 'POST', body: { amount } })
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader :title="t('water.title')" :subtitle="t('water.goal', { goal })" />

  <div class="d-flex justify-center mb-8">
    <v-progress-circular :model-value="pct" :size="180" :width="14" color="info">
      <div class="text-center">
        <div class="text-h5 font-weight-bold">{{ totalMl }}</div>
        <div class="text-caption text-medium-emphasis">ml · {{ pct }}%</div>
      </div>
    </v-progress-circular>
  </div>

  <v-row dense>
    <v-col v-for="amount in [250, 500, 1000]" :key="amount" cols="4">
      <v-btn block color="info" variant="tonal" size="large" :loading="busy" @click="add(amount)">
        {{ t('water.add', { amount }) }}
      </v-btn>
    </v-col>
  </v-row>
</template>
