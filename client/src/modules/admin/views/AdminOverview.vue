<script setup>
import { computed, onMounted, ref } from 'vue'
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

const googleOk = computed(() => Boolean(data.value?.settings?.google?.configured))
const vapidOk = computed(() => Boolean(data.value?.settings?.vapid?.configured))
</script>

<template>
  <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
  <div v-else-if="!data" class="text-medium-emphasis">{{ t('common.loading') }}</div>

  <div v-else class="d-flex flex-column ga-5">
    <section>
      <p class="cx-section-label">{{ t('admin.overview.statusTitle') }}</p>
      <v-row dense class="align-stretch">
        <v-col cols="12" sm="4">
          <div class="admin-stat">
            <div class="admin-stat__top">
              <v-icon icon="mdi-account-group-outline" color="primary" />
              <span class="admin-stat__label">{{ t('admin.overview.users') }}</span>
            </div>
            <div class="admin-stat__value">{{ data.stats.usersCount }}</div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="admin-stat">
            <div class="admin-stat__top">
              <v-icon icon="mdi-google" color="primary" />
              <span class="admin-stat__label">{{ t('admin.overview.google') }}</span>
            </div>
            <div class="admin-stat__value admin-stat__value--status">
              <v-chip
                size="small"
                :color="googleOk ? 'success' : 'warning'"
                :prepend-icon="googleOk ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
                variant="tonal"
              >
                {{ googleOk ? t('admin.overview.configured') : t('admin.overview.pending') }}
              </v-chip>
            </div>
            <div
              v-if="data.settings.google.sources"
              class="text-caption text-medium-emphasis mt-2"
            >
              {{ t('admin.overview.googleSource') }}:
              {{ data.settings.google.sources.clientSecret }}
            </div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="admin-stat">
            <div class="admin-stat__top">
              <v-icon icon="mdi-bell-ring-outline" color="primary" />
              <span class="admin-stat__label">{{ t('admin.overview.push') }}</span>
            </div>
            <div class="admin-stat__value admin-stat__value--status">
              <v-chip
                size="small"
                :color="vapidOk ? 'success' : 'warning'"
                :prepend-icon="vapidOk ? 'mdi-check-circle' : 'mdi-alert-circle-outline'"
                variant="tonal"
              >
                {{ vapidOk ? t('admin.overview.configured') : t('admin.overview.pending') }}
              </v-chip>
            </div>
          </div>
        </v-col>
      </v-row>
    </section>

    <section v-if="!googleOk || !vapidOk">
      <p class="cx-section-label">{{ t('admin.overview.todoTitle') }}</p>
      <div class="d-flex flex-column ga-3">
        <div v-if="!googleOk" class="cx-panel cx-panel--warm admin-cta">
          <div class="admin-cta__icon" aria-hidden="true">
            <v-icon icon="mdi-google" size="26" />
          </div>
          <div class="admin-cta__body">
            <div class="text-subtitle-1 font-weight-bold">{{ t('admin.overview.needGoogle') }}</div>
            <p class="text-body-2 text-medium-emphasis mb-3 mt-1">
              {{ t('admin.overview.needGoogleHint') }}
            </p>
            <v-btn color="primary" prepend-icon="mdi-arrow-right-circle" to="/admin/google">
              {{ t('admin.overview.startWizard') }}
            </v-btn>
          </div>
        </div>

        <div v-if="!vapidOk" class="cx-panel admin-cta">
          <div class="admin-cta__icon" aria-hidden="true">
            <v-icon icon="mdi-bell-ring-outline" size="26" color="primary" />
          </div>
          <div class="admin-cta__body">
            <div class="text-subtitle-1 font-weight-bold">{{ t('admin.overview.needVapid') }}</div>
            <p class="text-body-2 text-medium-emphasis mb-3 mt-1">
              {{ t('admin.overview.needVapidHint') }}
            </p>
            <v-btn color="primary" prepend-icon="mdi-arrow-right-circle" to="/admin/vapid">
              {{ t('admin.overview.startVapidWizard') }}
            </v-btn>
          </div>
        </div>
      </div>
    </section>

    <v-alert
      v-if="authStatus?.lastError"
      type="warning"
      variant="tonal"
      class="mb-0"
      icon="mdi-alert-outline"
    >
      <div class="text-subtitle-2 font-weight-bold mb-1">{{ t('admin.overview.lastGoogleError') }}</div>
      <div class="text-caption" style="word-break: break-all">{{ authStatus.lastError }}</div>
    </v-alert>

    <section>
      <p class="cx-section-label">{{ t('admin.overview.superadmins') }}</p>
      <div v-if="data.superadmins?.length" class="d-flex flex-column">
        <div v-for="u in data.superadmins" :key="u.id" class="cx-log d-flex align-center ga-3">
          <v-avatar color="primary" variant="tonal" size="40">
            <v-icon icon="mdi-shield-account-outline" />
          </v-avatar>
          <div class="min-w-0">
            <div class="font-weight-medium text-truncate">{{ u.name }}</div>
            <div class="text-caption text-medium-emphasis text-truncate">{{ u.email }}</div>
          </div>
        </div>
      </div>
      <div v-else class="cx-panel cx-panel--muted text-body-2 text-medium-emphasis">—</div>
    </section>
  </div>
</template>

<style scoped>
.admin-stat {
  height: 100%;
  padding: 1rem 1.05rem;
  border-radius: var(--cx-radius);
  background: var(--cx-surface-soft);
}
.admin-stat__top {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.65rem;
}
.admin-stat__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--cx-text-soft);
}
.admin-stat__value {
  font-family: var(--cx-font-display);
  font-size: clamp(1.4rem, 4vw, 1.7rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--cx-text);
}
.admin-stat__value--status {
  font-size: 1rem;
}
.admin-cta {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}
.admin-cta__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--cx-surface) 70%, transparent);
}
.admin-cta__body {
  min-width: 0;
  flex: 1;
}
</style>
