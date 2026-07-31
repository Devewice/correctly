<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'

const { t } = useI18n()
const data = ref(null)
const authStatus = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    const [overview, status] = await Promise.all([
      api('/admin/overview'),
      api('/auth/status'),
    ])
    data.value = overview
    authStatus.value = status
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
  <div v-else-if="!data" class="text-medium-emphasis">{{ t('common.loading') }}</div>

  <div v-else class="d-flex flex-column ga-4">
    <v-row dense class="align-stretch">
      <v-col cols="12" sm="4">
        <v-card class="pa-4 pa-sm-5 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('admin.overview.users') }}</div>
          <div class="cx-stat-card__value">{{ data.stats.usersCount }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 pa-sm-5 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('admin.overview.google') }}</div>
          <div class="cx-stat-card__value" style="font-size: 1.15rem">
            {{
              data.settings.google.configured
                ? t('admin.overview.configured')
                : t('admin.overview.pending')
            }}
          </div>
          <div
            v-if="data.settings.google.sources"
            class="text-caption text-medium-emphasis mt-2"
          >
            {{ t('admin.overview.googleSource') }}:
            {{ data.settings.google.sources.clientSecret }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 pa-sm-5 cx-stat-card">
          <div class="cx-stat-card__label">{{ t('admin.overview.push') }}</div>
          <div class="cx-stat-card__value" style="font-size: 1.15rem">
            {{
              data.settings.vapid?.configured
                ? t('admin.overview.configured')
                : t('admin.overview.pending')
            }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!data.settings.google.configured" class="cx-panel cx-panel--warm">
      <div class="text-h6 font-weight-bold">{{ t('admin.overview.needGoogle') }}</div>
      <p class="text-body-2 mt-1 mb-4">{{ t('admin.overview.needGoogleHint') }}</p>
      <v-btn color="primary" to="/admin/google">{{ t('admin.overview.startWizard') }}</v-btn>
    </div>

    <v-alert
      v-if="authStatus?.lastError"
      type="warning"
      variant="tonal"
      class="mb-0"
    >
      <div class="text-subtitle-2 font-weight-bold mb-1">{{ t('admin.overview.lastGoogleError') }}</div>
      <div class="text-caption" style="word-break: break-all">{{ authStatus.lastError }}</div>
    </v-alert>

    <v-card
      v-if="!data.settings.vapid?.configured"
      class="pa-5"
      color="accent"
      variant="tonal"
    >
      <div class="text-h6 font-weight-bold">{{ t('admin.overview.needVapid') }}</div>
      <p class="text-body-2 mt-1 mb-4">{{ t('admin.overview.needVapidHint') }}</p>
      <v-btn color="primary" to="/admin/vapid">{{ t('admin.overview.startVapidWizard') }}</v-btn>
    </v-card>

    <v-card class="pa-5">
      <div class="text-subtitle-1 font-weight-bold mb-3">{{ t('admin.overview.superadmins') }}</div>
      <v-list v-if="data.superadmins?.length" density="comfortable">
        <v-list-item
          v-for="u in data.superadmins"
          :key="u.id"
          :title="u.name"
          :subtitle="u.email"
        />
      </v-list>
      <p v-else class="text-body-2 text-medium-emphasis">—</p>
    </v-card>
  </div>
</template>
