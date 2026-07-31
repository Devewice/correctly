<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { JOURNAL_PROMPTS } from '@/shared/data/journalPrompts'

const { t } = useI18n()
const route = useRoute()
const text = ref('')
const entries = ref([])
const busy = ref(false)

async function load() {
  const data = await api('/journal')
  entries.value = data.entries || []
}

function usePrompt(key) {
  text.value = t(`journal.prompts.${key}`)
}

async function save() {
  if (!text.value.trim()) return
  busy.value = true
  try {
    await api('/journal', {
      method: 'POST',
      body: { content: text.value.trim(), type: 'free' },
    })
    text.value = ''
    await load()
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  const p = route.query.prompt
  if (typeof p === 'string' && JOURNAL_PROMPTS.some((x) => x.key === p)) {
    usePrompt(p)
  }
  load()
})
</script>

<template>
  <PageHeader :title="t('journal.title')" :subtitle="t('journal.subtitle')" />

  <v-card class="pa-4 pa-sm-5 mb-4 cx-panel--lift">
    <p class="text-caption text-medium-emphasis mb-2">{{ t('journal.promptsTitle') }}</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <button
        v-for="p in JOURNAL_PROMPTS"
        :key="p.key"
        type="button"
        class="select-tile"
        style="width: auto"
        @click="usePrompt(p.key)"
      >
        <span aria-hidden="true">{{ p.icon }}</span>
        {{ t(`journal.prompts.${p.key}`).slice(0, 22) }}…
      </button>
    </div>
    <v-textarea
      v-model="text"
      rows="4"
      auto-grow
      :label="t('journal.line')"
      class="mb-3"
    />
    <v-btn
      color="primary"
      block
      size="large"
      :loading="busy"
      :disabled="!text.trim()"
      @click="save"
    >
      {{ t('journal.save') }}
    </v-btn>
  </v-card>

  <div v-for="e in entries" :key="e.id" class="cx-log">
    <div class="text-body-2">{{ e.content }}</div>
    <div class="text-caption text-medium-emphasis mt-2">
      {{ new Date(e.loggedAt).toLocaleString() }}
    </div>
  </div>

  <p v-if="!entries.length" class="text-body-2 text-medium-emphasis">
    {{ t('journal.empty') }}
  </p>
</template>
