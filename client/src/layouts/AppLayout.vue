<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import BrandLogo from '@/shared/components/BrandLogo.vue'
import InstallAppCard from '@/shared/components/InstallAppCard.vue'
import SystemHealthBanner from '@/shared/components/SystemHealthBanner.vue'
import { fadeUp, withDelay } from '@/shared/motion/presets'
import { activeModuleSet } from '@/shared/utils/timeContext'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { mdAndUp, lgAndUp } = useDisplay()
const moreOpen = ref(false)
const drawer = ref(true)
const swipeStartY = ref(null)

watch(mdAndUp, (v) => {
  drawer.value = v
  if (v) moreOpen.value = false
})

const tab = computed(() => {
  if (route.path.startsWith('/profile')) return 'profile'
  if (route.path === '/dashboard' || route.path === '/') return 'today'
  return 'more'
})

/** Más muestra todo el catálogo; Hoy sigue filtrado por activeModules. */
const moreItems = computed(() => {
  const mods = activeModuleSet(auth.user)
  const all = [
    { to: '/water', module: 'water', title: t('modules.water'), icon: 'mdi-cup-water', hint: t('day.moreHints.water') },
    { to: '/meals', module: 'meals', title: t('modules.meals'), icon: 'mdi-food-apple', hint: t('day.moreHints.meals') },
    { to: '/mood', module: 'mood', title: t('modules.mood'), icon: 'mdi-emoticon-outline', hint: t('day.moreHints.mood') },
    { to: '/habits', module: 'habits', title: t('modules.habits'), icon: 'mdi-checkbox-marked-circle-outline', hint: t('day.moreHints.habits') },
    { to: '/sleep', module: 'sleep', title: t('modules.sleep'), icon: 'mdi-sleep', hint: t('day.moreHints.sleep') },
    { to: '/meditation', module: 'meditation', title: t('modules.meditation'), icon: 'mdi-meditation', hint: t('day.moreHints.meditation') },
    { to: '/activity', module: 'activity', title: t('modules.activity'), icon: 'mdi-run', hint: t('day.moreHints.activity') },
    { to: '/journal', module: 'journal', title: t('modules.journal'), icon: 'mdi-notebook-outline', hint: t('day.moreHints.journal') },
    { to: '/practices', module: null, title: t('practices.title'), icon: 'mdi-spa-outline', hint: t('day.moreHints.practices') },
    { to: '/weight', module: 'weight', title: t('modules.weight'), icon: 'mdi-scale-bathroom', hint: t('day.moreHints.weight') },
    { to: '/stats', module: null, title: t('stats.title'), icon: 'mdi-chart-bar', hint: t('day.moreHints.stats') },
    { to: '/friends', module: null, title: t('friends.title'), icon: 'mdi-account-group-outline', hint: t('day.moreHints.friends') },
    { to: '/reminders', module: null, title: t('reminders.title'), icon: 'mdi-bell-ring-outline', hint: t('day.moreHints.reminders') },
    { to: '/profile', module: null, title: t('nav.profile'), icon: 'mdi-account-circle-outline', hint: t('day.moreHints.profile') },
    { to: '/dashboard', module: null, title: t('nav.dashboard'), icon: 'mdi-white-balance-sunny', hint: t('day.moreHints.today') },
  ]
  // Activos primero; el resto sigue visible para no “perder” módulos
  return [...all].sort((a, b) => {
    const aActive = !a.module || mods.has(a.module) ? 0 : 1
    const bActive = !b.module || mods.has(b.module) ? 0 : 1
    return aActive - bActive
  })
})

/** Lateral: sin Hoy/Perfil (ya están arriba). */
const drawerMoreItems = computed(() =>
  moreItems.value.filter((item) => item.to !== '/dashboard' && item.to !== '/profile'),
)

const contentMax = computed(() => {
  if (lgAndUp.value) return 1100
  if (mdAndUp.value) return 820
  return 560
})

function go(path) {
  moreOpen.value = false
  router.push(path)
}

function toggleMore() {
  if (mdAndUp.value) {
    drawer.value = true
    return
  }
  moreOpen.value = !moreOpen.value
}

function closeMore() {
  moreOpen.value = false
}

function onSheetTouchStart(e) {
  swipeStartY.value = e.touches[0]?.clientY ?? null
}

function onSheetTouchEnd(e) {
  if (swipeStartY.value == null) return
  const y = e.changedTouches[0]?.clientY
  if (y != null && y - swipeStartY.value > 70) closeMore()
  swipeStartY.value = null
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
        v-for="item in drawerMoreItems"
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
    <v-btn value="more" prepend-icon="mdi-dots-grid" @click="toggleMore">
      {{ t('nav.more') }}
    </v-btn>
    <v-btn value="profile" to="/profile" prepend-icon="mdi-account-circle-outline">
      {{ t('nav.profile') }}
    </v-btn>
  </v-bottom-navigation>

  <v-bottom-sheet v-if="!mdAndUp" v-model="moreOpen">
    <v-card class="more-sheet">
      <div
        class="more-sheet__chrome"
        @touchstart.passive="onSheetTouchStart"
        @touchend.passive="onSheetTouchEnd"
      >
        <div class="more-sheet__handle" aria-hidden="true" />
        <div class="more-sheet__header">
          <div>
            <div v-motion v-bind="withDelay(fadeUp, 40)" class="text-subtitle-1 font-weight-bold">
              {{ t('day.moreTitle') }}
            </div>
            <p class="text-caption text-medium-emphasis mb-0">{{ t('day.moreSubtitle') }}</p>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :aria-label="t('common.close')"
            @click="closeMore"
          />
        </div>
      </div>

      <div class="more-sheet__body">
        <InstallAppCard compact />
        <div class="more-grid">
          <button
            v-for="item in moreItems"
            :key="item.to"
            type="button"
            class="more-row"
            :class="{ 'more-row--active': route.path === item.to }"
            @click="go(item.to)"
          >
            <v-icon :icon="item.icon" size="22" color="primary" class="more-row__icon" />
            <span class="more-row__title">{{ item.title }}</span>
          </button>
        </div>
      </div>
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
  border-radius: 16px 16px 0 0 !important;
  max-height: min(85dvh, 720px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.more-sheet__chrome {
  flex-shrink: 0;
  padding: 8px 12px 4px;
  touch-action: pan-y;
}
.more-sheet__handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: rgba(61, 61, 61, 0.28);
  margin: 0 auto 8px;
}
.more-sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.more-sheet__body {
  padding: 8px 12px max(20px, calc(env(safe-area-inset-bottom) + 12px));
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.more-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.more-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid rgba(94, 122, 91, 0.18);
  border-radius: 12px;
  background: #efe6da;
  color: #3d3d3d;
  text-align: left;
  cursor: pointer;
}
.more-row--active {
  border-color: #8ba888;
  background: #e7f0e5;
}
.more-row__icon {
  flex-shrink: 0;
}
.more-row__title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
  color: #3d3d3d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
