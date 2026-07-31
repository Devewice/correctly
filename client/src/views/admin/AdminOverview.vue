<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'

const { t } = useI18n()
const data = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    data.value = await api('/admin/overview')
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <div v-if="error" class="rounded-2xl bg-danger/10 p-4 text-danger">{{ error }}</div>
  <div v-else-if="!data" class="text-muted">{{ t('common.loading') }}</div>
  <div v-else class="space-y-5">
    <section class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-3xl bg-white p-5 ring-1 ring-black/5">
        <p class="text-xs text-muted">{{ t('admin.overview.users') }}</p>
        <p class="font-display text-3xl font-extrabold">{{ data.stats.usersCount }}</p>
      </div>
      <div class="rounded-3xl bg-white p-5 ring-1 ring-black/5">
        <p class="text-xs text-muted">{{ t('admin.overview.google') }}</p>
        <p class="font-display text-xl font-extrabold">
          {{
            data.settings.google.configured
              ? t('admin.overview.configured')
              : t('admin.overview.pending')
          }}
        </p>
      </div>
      <div class="rounded-3xl bg-white p-5 ring-1 ring-black/5">
        <p class="text-xs text-muted">{{ t('admin.overview.wizard') }}</p>
        <p class="font-display text-xl font-extrabold">
          {{
            data.settings.google.wizardDone
              ? t('admin.overview.done')
              : t('admin.overview.notDone')
          }}
        </p>
      </div>
    </section>

    <section
      v-if="!data.settings.google.configured"
      class="rounded-3xl bg-peach/40 p-6 ring-1 ring-peach/50"
    >
      <h2 class="font-display text-xl font-bold">{{ t('admin.overview.needGoogle') }}</h2>
      <p class="mt-2 text-sm text-muted">{{ t('admin.overview.needGoogleHint') }}</p>
      <RouterLink
        to="/admin/google"
        class="mt-4 inline-flex rounded-2xl bg-sage px-5 py-3 text-sm font-medium text-white"
      >
        {{ t('admin.overview.startWizard') }}
      </RouterLink>
    </section>

    <section class="rounded-3xl bg-white p-5 ring-1 ring-black/5">
      <h2 class="mb-3 font-display text-lg font-bold">{{ t('admin.overview.superadmins') }}</h2>
      <ul class="space-y-2 text-sm">
        <li v-for="u in data.stats.superadmins" :key="u.id" class="rounded-xl bg-sand/70 px-3 py-2">
          {{ u.name }} · {{ u.email }}
        </li>
      </ul>
    </section>
  </div>
</template>
