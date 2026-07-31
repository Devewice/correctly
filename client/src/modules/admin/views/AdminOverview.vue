<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'

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
  <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
  <div v-else-if="!data" class="text-medium-emphasis">{{ t('common.loading') }}</div>

  <div v-else class="d-flex flex-column ga-4">
    <v-row dense>
      <v-col cols="12" sm="4">
        <v-card class="pa-5">
          <div class="text-caption text-medium-emphasis">{{ t('admin.overview.users') }}</div>
          <div class="text-h4 font-weight-bold">{{ data.stats.usersCount }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-5">
          <div class="text-caption text-medium-emphasis">{{ t('admin.overview.google') }}</div>
          <div class="text-h6 font-weight-bold">
            {{
              data.settings.google.configured
                ? t('admin.overview.configured')
                : t('admin.overview.pending')
            }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-5">
          <div class="text-caption text-medium-emphasis">{{ t('admin.overview.push') }}</div>
          <div class="text-h6 font-weight-bold">
            {{
              data.settings.vapid?.configured
                ? t('admin.overview.configured')
                : t('admin.overview.pending')
            }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="!data.settings.google.configured" class="pa-5" color="secondary" variant="tonal">
      <div class="text-h6 font-weight-bold">{{ t('admin.overview.needGoogle') }}</div>
      <p class="text-body-2 mt-1 mb-4">{{ t('admin.overview.needGoogleHint') }}</p>
      <v-btn color="primary" to="/admin/google">{{ t('admin.overview.startWizard') }}</v-btn>
    </v-card>

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
