<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const links = [
  { to: '/admin', key: 'overview', icon: 'mdi-view-dashboard-outline' },
  { to: '/admin/google', key: 'google', icon: 'mdi-google' },
  { to: '/admin/users', key: 'users', icon: 'mdi-account-group-outline' },
]
</script>

<template>
  <v-app-bar>
    <v-app-bar-title>
      <div class="text-caption text-primary text-uppercase font-weight-bold">
        {{ t('admin.badge') }}
      </div>
      <div class="text-h6">{{ t('admin.title') }}</div>
    </v-app-bar-title>
    <template #append>
      <span class="text-medium-emphasis me-3 d-none d-sm-inline">{{ auth.user?.name }}</span>
      <v-btn variant="tonal" prepend-icon="mdi-arrow-left" @click="router.push('/dashboard')">
        {{ t('admin.backApp') }}
      </v-btn>
    </template>
  </v-app-bar>

  <v-main>
    <v-container style="max-width: 960px" class="py-6">
      <v-tabs :model-value="route.path" color="primary" class="mb-6">
        <v-tab
          v-for="link in links"
          :key="link.to"
          :value="link.to"
          :to="link.to"
          :prepend-icon="link.icon"
        >
          {{ t(`admin.nav.${link.key}`) }}
        </v-tab>
      </v-tabs>

      <router-view />
    </v-container>
  </v-main>
</template>
