<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { smAndUp } = useDisplay()

const links = [
  { to: '/admin', key: 'overview', icon: 'mdi-view-dashboard-outline' },
  { to: '/admin/google', key: 'google', icon: 'mdi-google' },
  { to: '/admin/vapid', key: 'vapid', icon: 'mdi-bell-ring-outline' },
  { to: '/admin/users', key: 'users', icon: 'mdi-account-group-outline' },
]
</script>

<template>
  <v-app-bar density="comfortable">
    <v-app-bar-title class="admin-title">
      <div class="text-caption text-primary text-uppercase font-weight-bold">
        {{ t('admin.badge') }}
      </div>
      <div class="text-subtitle-1 font-weight-bold text-truncate">{{ t('admin.title') }}</div>
    </v-app-bar-title>
    <template #append>
      <span class="text-medium-emphasis me-3 d-none d-sm-inline text-truncate">
        {{ auth.user?.name }}
      </span>
      <v-btn
        variant="tonal"
        :icon="smAndUp ? undefined : 'mdi-arrow-left'"
        :prepend-icon="smAndUp ? 'mdi-arrow-left' : undefined"
        :aria-label="t('admin.backApp')"
        @click="router.push('/dashboard')"
      >
        <span v-if="smAndUp">{{ t('admin.backApp') }}</span>
      </v-btn>
    </template>
  </v-app-bar>

  <v-main class="admin-shell">
    <v-container class="py-4 py-md-8 px-3 px-sm-4" style="max-width: 1040px">
      <p class="cx-section-label mb-2">{{ t('admin.badge') }}</p>
      <v-tabs
        :model-value="route.path"
        color="primary"
        class="mb-4 mb-md-6"
        show-arrows
        density="comfortable"
      >
        <v-tab
          v-for="link in links"
          :key="link.to"
          :value="link.to"
          :to="link.to"
          :prepend-icon="link.icon"
        >
          <span class="d-none d-sm-inline">{{ t(`admin.nav.${link.key}`) }}</span>
          <span class="d-inline d-sm-none">{{ t(`admin.navShort.${link.key}`) }}</span>
        </v-tab>
      </v-tabs>

      <router-view />
    </v-container>
  </v-main>
</template>

<style scoped>
.admin-title {
  min-width: 0;
}
.admin-shell {
  background: var(--cx-bg);
}
</style>
