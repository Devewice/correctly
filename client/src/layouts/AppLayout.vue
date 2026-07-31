<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import BrandLogo from '@/shared/components/BrandLogo.vue'
import InstallAppCard from '@/shared/components/InstallAppCard.vue'
import SystemHealthBanner from '@/shared/components/SystemHealthBanner.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { mdAndUp, lgAndUp } = useDisplay()
const moreOpen = ref(false)
const drawer = ref(true)

watch(mdAndUp, (v) => {
  drawer.value = v
  if (v) moreOpen.value = false
})

const tab = computed(() => {
  if (route.path.startsWith('/profile')) return 'profile'
  if (route.path === '/dashboard' || route.path === '/') return 'today'
  return 'more'
})

const moreItems = computed(() => [
  { to: '/water', title: t('water.title'), icon: 'mdi-cup-water', hint: t('day.moreHints.water') },
  { to: '/meals', title: t('meals.title'), icon: 'mdi-food-apple', hint: t('day.moreHints.meals') },
  { to: '/mood', title: t('mood.title'), icon: 'mdi-emoticon-outline', hint: t('day.moreHints.mood') },
  { to: '/habits', title: t('habits.title'), icon: 'mdi-checkbox-marked-circle-outline', hint: t('day.moreHints.habits') },
  { to: '/sleep', title: t('sleep.title'), icon: 'mdi-sleep', hint: t('day.moreHints.sleep') },
  { to: '/meditation', title: t('meditation.title'), icon: 'mdi-meditation', hint: t('day.moreHints.meditation') },
  { to: '/activity', title: t('activity.title'), icon: 'mdi-run', hint: t('day.moreHints.activity') },
  { to: '/weight', title: t('weight.title'), icon: 'mdi-scale-bathroom', hint: t('day.moreHints.weight') },
  { to: '/stats', title: t('stats.title'), icon: 'mdi-chart-bar', hint: t('day.moreHints.stats') },
  { to: '/friends', title: t('friends.title'), icon: 'mdi-account-group-outline', hint: t('day.moreHints.friends') },
  { to: '/reminders', title: t('reminders.title'), icon: 'mdi-bell-ring-outline', hint: t('day.moreHints.reminders') },
])

const contentMax = computed(() => {
  if (lgAndUp.value) return 1100
  if (mdAndUp.value) return 820
  return 560
})

function go(path) {
  moreOpen.value = false
  router.push(path)
}

function openMore() {
  if (mdAndUp.value) {
    drawer.value = true
    return
  }
  moreOpen.value = true
}

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <!-- Tablet / Desktop: menú lateral -->
  <v-navigation-drawer
    v-if="mdAndUp"
    v-model="drawer"
    permanent
    :rail="mdAndUp && !lgAndUp"
    :width="280"
    class="app-drawer"
  >
    <div class="pa-4" :class="{ 'px-2': !lgAndUp }">
      <BrandLogo v-if="lgAndUp" :size="40" />
      <v-avatar v-else color="primary" variant="tonal" size="40">
        <v-icon icon="mdi-heart-pulse" />
      </v-avatar>
    </div>

    <v-list nav density="comfortable" class="px-2">
      <v-list-item
        to="/dashboard"
        prepend-icon="mdi-white-balance-sunny"
        :title="lgAndUp ? t('nav.dashboard') : undefined"
        :active="tab === 'today'"
        color="primary"
        rounded="lg"
      />
      <v-list-item
        to="/profile"
        prepend-icon="mdi-account-circle-outline"
        :title="lgAndUp ? t('nav.profile') : undefined"
        :active="tab === 'profile'"
        color="primary"
        rounded="lg"
      />
    </v-list>

    <v-divider class="my-2" />

    <v-list-subheader v-if="lgAndUp" class="px-4">
      {{ t('day.moreTitle') }}
    </v-list-subheader>

    <v-list nav density="comfortable" class="px-2">
      <v-list-item
        v-for="item in moreItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="lgAndUp ? item.title : undefined"
        :subtitle="lgAndUp ? item.hint : undefined"
        :active="route.path === item.to"
        color="primary"
        rounded="lg"
      />
    </v-list>

    <template #append>
      <div class="pa-3">
        <v-btn
          v-if="auth.user?.role === 'superadmin'"
          :block="lgAndUp"
          :icon="!lgAndUp ? 'mdi-shield-crown-outline' : undefined"
          variant="tonal"
          color="primary"
          class="mb-2"
          to="/admin"
          :prepend-icon="lgAndUp ? 'mdi-shield-crown-outline' : undefined"
        >
          <span v-if="lgAndUp">{{ t('admin.badge') }}</span>
        </v-btn>
        <v-btn
          :block="lgAndUp"
          :icon="!lgAndUp ? 'mdi-logout-variant' : undefined"
          variant="text"
          :prepend-icon="lgAndUp ? 'mdi-logout-variant' : undefined"
          @click="logout"
        >
          <span v-if="lgAndUp">{{ t('common.logout') }}</span>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar elevation="0" :height="mdAndUp ? 72 : 64">
    <v-app-bar-title class="ms-2">
      <BrandLogo v-if="!mdAndUp" :size="32" variant="full" class="app-bar-brand">
        <template #tagline>
          <span class="d-none" />
        </template>
      </BrandLogo>
      <div v-else class="d-flex align-center ga-3">
        <span class="text-h6 font-weight-bold text-primary-darken-1 d-none d-lg-inline">
          {{ t('app.name') }}
        </span>
        <span class="text-body-2 text-medium-emphasis d-none d-lg-inline">
          {{ t('app.tagline') }}
        </span>
        <span v-if="mdAndUp && !lgAndUp" class="text-subtitle-1 font-weight-bold text-primary-darken-1">
          {{ t('app.name') }}
        </span>
      </div>
    </v-app-bar-title>
    <template #append>
      <div v-if="mdAndUp" class="d-flex align-center ga-2 me-2">
        <v-chip
          size="small"
          :color="tab === 'today' ? 'primary' : undefined"
          :variant="tab === 'today' ? 'flat' : 'tonal'"
          label
          to="/dashboard"
          prepend-icon="mdi-white-balance-sunny"
        >
          {{ t('nav.dashboard') }}
        </v-chip>
        <v-chip
          size="small"
          :color="tab === 'profile' ? 'primary' : undefined"
          :variant="tab === 'profile' ? 'flat' : 'tonal'"
          label
          to="/profile"
          prepend-icon="mdi-account-circle-outline"
        >
          {{ t('nav.profile') }}
        </v-chip>
        <v-chip
          v-if="auth.user?.name"
          size="small"
          variant="tonal"
          class="d-none d-md-inline-flex"
        >
          {{ auth.user.name.split(' ')[0] }}
        </v-chip>
      </div>
      <template v-else>
        <v-btn
          v-if="auth.user?.role === 'superadmin'"
          icon="mdi-shield-crown-outline"
          variant="text"
          to="/admin"
          :aria-label="t('admin.badge')"
        />
        <v-btn
          icon="mdi-logout-variant"
          variant="text"
          :aria-label="t('common.logout')"
          @click="logout"
        />
      </template>
    </template>
  </v-app-bar>

  <v-main>
    <v-container
      class="py-4 py-md-6 py-lg-8"
      :class="{ 'pb-10': !mdAndUp }"
      :style="{ maxWidth: `${contentMax}px` }"
    >
      <SystemHealthBanner />
      <router-view />
    </v-container>
  </v-main>

  <!-- Solo móvil -->
  <v-bottom-navigation
    v-if="!mdAndUp"
    :model-value="tab"
    grow
    app
    color="primary"
    elevation="8"
    class="app-bottom-nav"
  >
    <v-btn value="today" to="/dashboard" prepend-icon="mdi-white-balance-sunny">
      {{ t('nav.dashboard') }}
    </v-btn>
    <v-btn value="more" prepend-icon="mdi-dots-grid" @click="openMore">
      {{ t('nav.more') }}
    </v-btn>
    <v-btn value="profile" to="/profile" prepend-icon="mdi-account-circle-outline">
      {{ t('nav.profile') }}
    </v-btn>
  </v-bottom-navigation>

  <v-bottom-sheet v-if="!mdAndUp" v-model="moreOpen" inset>
    <v-card class="pa-4 more-sheet">
      <div
        v-motion
        v-bind="withDelay(fadeUp, 40)"
        class="text-h6 font-weight-bold mb-1"
      >
        {{ t('day.moreTitle') }}
      </div>
      <p
        v-motion
        v-bind="withDelay(fadeUp, 90)"
        class="text-body-2 text-medium-emphasis mb-3"
      >
        {{ t('day.moreSubtitle') }}
      </p>
      <InstallAppCard />
      <v-row dense>
        <v-col v-for="(item, i) in moreItems" :key="item.to" cols="6">
          <div
            v-motion
            v-bind="{
              ...softHover,
              ...withDelay(fadeUp, 120 + i * 40),
            }"
          >
            <v-card
              variant="tonal"
              color="surface-light"
              class="pa-3 h-100"
              @click="go(item.to)"
            >
              <v-icon :icon="item.icon" color="primary" class="mb-1" />
              <div class="text-subtitle-2 font-weight-bold">{{ item.title }}</div>
              <div class="text-caption text-medium-emphasis text-truncate d-none d-sm-block">
                {{ item.hint }}
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-bottom-sheet>
</template>

<style scoped>
.app-bar-brand :deep(.brand-logo__name) {
  font-size: 1.15rem;
}
.app-bar-brand :deep(.brand-logo__tagline) {
  display: none;
}
.app-bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
.more-sheet {
  padding-bottom: max(24px, env(safe-area-inset-bottom)) !important;
  max-height: min(85dvh, 720px);
  overflow-y: auto;
}
</style>
