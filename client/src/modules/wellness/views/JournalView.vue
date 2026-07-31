<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

const { t } = useI18n()
const text = ref('')
const entries = ref([])
const busy = ref(false)

async function load() {
  const data = await api('/journal')
  entries.value = data.entries || []
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

onMounted(load)
</script>

<template>
  <PageHeader :title="t('journal.title')" :subtitle="t('journal.subtitle')" />

  <v-card class="pa-4 mb-4">
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

  <v-card v-for="e in entries" :key="e.id" class="pa-4 mb-2">
    <div class="text-body-2">{{ e.content }}</div>
    <div class="text-caption text-medium-emphasis mt-2">
      {{ new Date(e.loggedAt).toLocaleString() }}
    </div>
  </v-card>

  <p v-if="!entries.length" class="text-body-2 text-medium-emphasis">
    {{ t('journal.empty') }}
  </p>
</template>
