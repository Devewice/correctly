<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { WATER_OPTIONS, glassesFromMl } from '@/shared/utils/water'
import { softHover, withDelay, fadeUp } from '@/shared/motion/presets'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const totalMl = ref(0)
const goalGlasses = 8
const busy = ref(false)

const glasses = computed(() => glassesFromMl(totalMl.value))
const pct = computed(() => Math.min(100, Math.round((glasses.value / goalGlasses) * 100)))

const labels = {
  sip: 'water.addSip',
  glass: 'water.addGlass',
  bottle: 'water.addBottle',
}

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

onMounted(async () => {
  await load()
  const ml = Number(route.query.ml || route.query.quick)
  if (ml > 0) {
    await add(ml)
    router.replace({ path: '/water', query: {} })
  }
})
</script>

<template>
  <PageHeader :title="t('water.title')" :subtitle="t('water.goal')" />

  <div
    v-motion
    v-bind="withDelay(fadeUp, 60)"
    class="d-flex justify-center mb-8"
  >
    <v-progress-circular :model-value="pct" :size="180" :width="14" color="info">
      <div class="text-center px-2">
        <div class="text-h5 font-weight-bold">{{ glasses }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ t('water.todayGlasses', { n: glasses }) }}
        </div>
      </div>
    </v-progress-circular>
  </div>

  <v-row dense>
    <v-col v-for="(opt, i) in WATER_OPTIONS" :key="opt.ml" cols="12" sm="4">
      <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 120 + i * 60) }">
        <v-btn
          block
          color="info"
          variant="tonal"
          size="large"
          height="56"
          class="text-body-2"
          :loading="busy"
          @click="add(opt.ml)"
        >
          {{ t(labels[opt.key]) }}
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>
