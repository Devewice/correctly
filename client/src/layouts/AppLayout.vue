<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { mdAndUp } = useDisplay()
const drawer = ref(true)

const primaryNav = computed(() => [
  { to: '/dashboard', title: t('nav.dashboard'), icon: 'mdi-home-heart' },
  { to: '/meals', title: t('nav.meals'), icon: 'mdi-food-apple' },
  { to: '/mood', title: t('nav.mood'), icon: 'mdi-emoticon-outline' },
  { to: '/habits', title: t('nav.habits'), icon: 'mdi-checkbox-marked-circle-outline' },
  { to: '/stats', title: t('nav.stats'), icon: 'mdi-chart-bar' },
])

const secondaryNav = computed(() => [
  { to: '/water', title: t('nav.water'), icon: 'mdi-cup-water' },
  { to: '/sleep', title: t('nav.sleep'), icon: 'mdi-sleep' },
  { to: '/meditation', title: t('nav.meditation'), icon: 'mdi-meditation' },
  { to: '/activity', title: t('nav.activity'), icon: 'mdi-run' },
  { to: '/weight', title: t('nav.weight'), icon: 'mdi-scale-bathroom' },
  { to: '/profile', title: t('nav.profile'), icon: 'mdi-account-circle-outline' },
])

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
    width="260"
  >
    <v-list-item
      class="py-4 px-2"
      :title="t('app.name')"
      :subtitle="t('app.tagline')"
    >
      <template #prepend>
        <v-avatar color="primary" variant="tonal" size="40">
          <v-icon icon="mdi-heart-pulse" />
        </v-avatar>
      </template>
    </v-list-item>

    <v-divider />

    <v-list nav density="comfortable" class="px-2">
      <v-list-subheader>{{ t('nav.dashboard') }}</v-list-subheader>
      <v-list-item
        v-for="item in primaryNav"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="route.path === item.to"
        color="primary"
        rounded="lg"
      />

      <v-list-subheader class="mt-2">{{ t('dashboard.more') }}</v-list-subheader>
      <v-list-item
        v-for="item in secondaryNav"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="route.path === item.to"
        color="primary"
        rounded="lg"
      />
    </v-list>

    <template #append>
      <div class="pa-3">
        <v-btn
          v-if="auth.user?.role === 'superadmin'"
          block
          variant="tonal"
          color="primary"
          class="mb-2"
          to="/admin"
          prepend-icon="mdi-shield-crown-outline"
        >
          {{ t('admin.badge') }}
        </v-btn>
        <v-btn
          block
          variant="text"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          {{ t('common.logout') }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar>
    <v-app-bar-nav-icon
      v-if="!mdAndUp"
      @click="drawer = !drawer"
    />
    <v-app-bar-title class="font-weight-bold text-primary-darken-1">
      {{ t('app.name') }}
    </v-app-bar-title>
    <template #append>
      <v-btn variant="text" class="text-none" to="/profile">
        <v-avatar v-if="auth.user?.avatar" size="28" class="me-2">
          <v-img :src="auth.user.avatar" alt="" />
        </v-avatar>
        <span class="d-none d-sm-inline">{{ auth.user?.name }}</span>
      </v-btn>
    </template>
  </v-app-bar>

  <v-main>
    <v-container class="py-6" style="max-width: 960px">
      <router-view />
    </v-container>
  </v-main>

  <v-bottom-navigation
    v-if="!mdAndUp"
    :model-value="route.path"
    grow
    app
  >
    <v-btn
      v-for="item in primaryNav"
      :key="item.to"
      :value="item.to"
      :to="item.to"
      :prepend-icon="item.icon"
    >
      {{ item.title }}
    </v-btn>
  </v-bottom-navigation>
</template>
