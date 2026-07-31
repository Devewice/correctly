<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppShell from '@/components/layout/AppShell.vue'
import { api } from '@/utils/api'

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
  <AppShell>
    <h1 class="mb-2 font-display text-3xl font-extrabold">{{ t('weight.title') }}</h1>
    <p class="mb-6 text-sm text-muted">{{ t('weight.subtitle') }}</p>

    <div v-if="latest" class="mb-6 rounded-3xl bg-peach/35 p-5 ring-1 ring-peach/50">
      <p class="text-xs text-muted">{{ t('weight.latest') }}</p>
      <p class="font-display text-4xl font-extrabold text-ink">
        {{ latest.weight }} <span class="text-lg">kg</span>
      </p>
      <p v-if="delta !== null" class="mt-1 text-sm" :class="delta <= 0 ? 'text-success' : 'text-muted'">
        {{ delta > 0 ? '+' : '' }}{{ delta }} kg
      </p>
    </div>

    <form class="mb-6 space-y-3 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5" @submit.prevent="save">
      <label class="block text-sm">
        {{ t('weight.value') }}
        <input
          v-model.number="form.weight"
          type="number"
          step="0.1"
          min="20"
          max="400"
          required
          class="mt-1 w-full rounded-xl bg-sand px-3 py-2"
        />
      </label>
      <label class="block text-sm">
        {{ t('weight.notes') }}
        <input v-model="form.notes" type="text" class="mt-1 w-full rounded-xl bg-sand px-3 py-2" />
      </label>
      <button type="submit" class="w-full rounded-2xl bg-sage py-3 text-white" :disabled="busy">
        {{ t('weight.save') }}
      </button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="log in logs"
        :key="log.id"
        class="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-sm ring-1 ring-black/5"
      >
        <span class="font-medium">{{ log.weight }} kg</span>
        <span class="text-xs text-muted">{{ new Date(log.loggedAt).toLocaleDateString() }}</span>
      </li>
    </ul>
  </AppShell>
</template>
