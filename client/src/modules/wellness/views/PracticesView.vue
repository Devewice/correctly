<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { PRACTICES } from '@/shared/data/practices'

const { t } = useI18n()
const router = useRouter()
const busyId = ref(null)

async function run(p) {
  busyId.value = p.id
  try {
    if (p.kind === 'meditation') {
      await api('/meditation', {
        method: 'POST',
        body: { duration: p.minutes, type: p.type || 'breathing', feeling: 'calmer' },
      })
      await router.push('/meditation')
      return
    }
    if (p.kind === 'activity') {
      await api('/activities', {
        method: 'POST',
        body: {
          type: p.activityType || 'stretch',
          duration: p.minutes,
          intensity: p.intensity || 'light',
        },
      })
      return
    }
    if (p.kind === 'water') {
      await api('/water', { method: 'POST', body: { amount: p.ml || 250 } })
      return
    }
    if (p.kind === 'journal') {
      await router.push({ path: '/journal', query: { prompt: p.promptKey || 'peace' } })
    }
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <PageHeader :title="t('practices.title')" :subtitle="t('practices.subtitle')" />

  <v-row dense>
    <v-col v-for="p in PRACTICES" :key="p.id" cols="12" sm="6">
      <button
        type="button"
        class="practice-card"
        :disabled="busyId === p.id"
        @click="run(p)"
      >
        <span class="practice-card__icon" aria-hidden="true">{{ p.icon }}</span>
        <span class="practice-card__body">
          <span class="practice-card__title">{{ t(`practices.items.${p.id}.title`) }}</span>
          <span class="practice-card__meta">
            {{ t('practices.minutes', { n: p.minutes }) }} ·
            {{ t(`practices.items.${p.id}.hint`) }}
          </span>
        </span>
      </button>
    </v-col>
  </v-row>
</template>

<style scoped>
.practice-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  width: 100%;
  min-height: 5.25rem;
  padding: 1rem;
  border-radius: var(--cx-radius);
  border: 1.5px solid var(--cx-border);
  background: var(--cx-surface);
  color: var(--cx-text);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--cx-shadow);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.practice-card:hover {
  border-color: var(--cx-primary);
  background: var(--cx-primary-soft);
}
.practice-card:disabled {
  opacity: 0.6;
}
.practice-card__icon {
  font-size: 1.75rem;
  line-height: 1;
}
.practice-card__title {
  display: block;
  font-weight: 700;
  font-size: 0.95rem;
}
.practice-card__meta {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--cx-text-soft);
  line-height: 1.35;
}
</style>
