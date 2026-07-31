<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const links = [
  { to: '/admin', key: 'overview', exact: true },
  { to: '/admin/google', key: 'google' },
  { to: '/admin/users', key: 'users' },
]
</script>

<template>
  <v-layout>
    <v-app-bar flat color="surface" border="b">
      <v-app-bar-title>
        <div class="text-caption text-primary text-uppercase font-weight-bold">
          {{ t('admin.badge') }}
        </div>
        <div class="text-h6">{{ t('admin.title') }}</div>
      </v-app-bar-title>
      <template #append>
        <span class="text-medium-emphasis me-3 d-none d-sm-inline">{{ auth.user?.name }}</span>
        <v-btn variant="tonal" @click="router.push('/dashboard')">
          {{ t('admin.backApp') }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container style="max-width: 960px" class="py-4">
        <v-chip-group mandatory selected-class="text-primary">
          <v-chip
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :variant="
              (link.exact ? route.path === link.to : route.path.startsWith(link.to))
                ? 'flat'
                : 'outlined'
            "
            :color="
              (link.exact ? route.path === link.to : route.path.startsWith(link.to))
                ? 'primary'
                : undefined
            "
            filter
          >
            {{ t(`admin.nav.${link.key}`) }}
          </v-chip>
        </v-chip-group>

        <div class="mt-4">
          <router-view />
        </div>
      </v-container>
    </v-main>
  </v-layout>
</template>
