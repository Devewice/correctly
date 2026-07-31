<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

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
  <AppShell>
    <h1 class="mb-2 font-display text-3xl font-800">{{ t('water.title') }}</h1>
    <p class="mb-6 text-sm text-muted">{{ t('water.goal', { goal }) }}</p>

    <div class="mx-auto mb-8 flex h-56 w-40 flex-col justify-end overflow-hidden rounded-[2.5rem] bg-sky/20 ring-2 ring-sky/40">
      <div
        class="bg-gradient-to-t from-sky to-sky/60 transition-all duration-700"
        :style="{ height: `${pct}%` }"
      />
    </div>

    <p class="mb-6 text-center font-display text-4xl font-800 text-sage-dark">
      {{ totalMl }} ml
      <span class="block text-base font-600 text-muted">{{ pct }}%</span>
    </p>

    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="amount in [250, 500, 1000]"
        :key="amount"
        type="button"
        class="rounded-2xl bg-sky/50 py-4 text-sm font-medium text-ink ring-1 ring-sky/60 disabled:opacity-50"
        :disabled="busy"
        @click="add(amount)"
      >
        {{ t('water.add', { amount }) }}
      </button>
    </div>
  </AppShell>
</template>
