<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const nav = computed(() => [
  { to: '/dashboard', title: t('nav.dashboard'), icon: 'mdi-home-heart' },
  { to: '/meals', title: t('nav.meals'), icon: 'mdi-food-apple' },
  { to: '/mood', title: t('nav.mood'), icon: 'mdi-emoticon-outline' },
  { to: '/habits', title: t('nav.habits'), icon: 'mdi-checkbox-marked-circle-outline' },
  { to: '/meditation', title: t('nav.meditation'), icon: 'mdi-meditation' },
  { to: '/stats', title: t('nav.stats'), icon: 'mdi-chart-bar' },
])

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <v-layout class="correctly-app">
    <v-app-bar flat color="surface" border="b">
      <v-app-bar-title class="font-weight-bold text-primary-darken-1">
        {{ t('app.name') }}
      </v-app-bar-title>
      <template #append>
        <v-btn
          v-if="auth.user?.role === 'superadmin'"
          variant="flat"
          color="on-surface"
          class="me-2"
          size="small"
          to="/admin"
        >
          {{ t('admin.badge') }}
        </v-btn>
        <v-btn variant="text" :to="'/profile'" class="text-none">
          <v-avatar v-if="auth.user?.avatar" size="28" class="me-2">
            <v-img :src="auth.user.avatar" />
          </v-avatar>
          {{ auth.user?.name }}
        </v-btn>
        <v-btn icon="mdi-logout" variant="text" @click="logout" />
      </template>
    </v-app-bar>

    <v-main>
      <v-container class="py-6" style="max-width: 960px">
        <router-view />
      </v-container>
    </v-main>

    <v-bottom-navigation
      :model-value="route.path"
      color="primary"
      grow
      class="d-md-none"
      elevation="8"
    >
      <v-btn
        v-for="item in nav"
        :key="item.to"
        :value="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
      >
        {{ item.title }}
      </v-btn>
    </v-bottom-navigation>

    <v-footer
      app
      class="d-none d-md-flex justify-center ga-2 py-3"
      color="transparent"
    >
      <v-chip
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :color="route.path === item.to ? 'primary' : undefined"
        :variant="route.path === item.to ? 'flat' : 'outlined'"
        size="small"
        label
      >
        <v-icon start :icon="item.icon" size="16" />
        {{ item.title }}
      </v-chip>
    </v-footer>
  </v-layout>
</template>
