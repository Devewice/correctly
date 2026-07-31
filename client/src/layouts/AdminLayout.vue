<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import BrandLogo from '@/shared/components/BrandLogo.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { mdAndUp } = useDisplay()

const links = [
  { to: '/admin', key: 'overview', icon: 'mdi-view-dashboard-outline', match: (p) => p === '/admin' },
  {
    to: '/admin/google',
    key: 'google',
    icon: 'mdi-google',
    match: (p) => p.startsWith('/admin/google'),
  },
  {
    to: '/admin/vapid',
    key: 'vapid',
    icon: 'mdi-bell-ring-outline',
    match: (p) => p.startsWith('/admin/vapid'),
  },
  {
    to: '/admin/users',
    key: 'users',
    icon: 'mdi-account-group-outline',
    match: (p) => p.startsWith('/admin/users'),
  },
]

const activeKey = computed(() => links.find((l) => l.match(route.path))?.key || 'overview')
</script>

<template>
  <v-app-bar class="admin-bar" density="comfortable">
    <v-btn
      class="ms-1"
      icon="mdi-arrow-left"
      variant="text"
      :aria-label="t('admin.backApp')"
      @click="router.push('/dashboard')"
    />
    <v-app-bar-title class="admin-bar__title">
      <div class="admin-bar__brand">
        <BrandLogo variant="full" :size="28" class="admin-bar__logo" />
        <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-shield-crown-outline">
          {{ t('admin.badge') }}
        </v-chip>
      </div>
    </v-app-bar-title>
    <template #append>
      <v-chip
        v-if="auth.user?.name"
        size="small"
        variant="tonal"
        class="me-2"
        prepend-icon="mdi-account-circle-outline"
      >
        <span class="d-none d-sm-inline">{{ auth.user.name.split(' ')[0] }}</span>
        <span class="d-inline d-sm-none">{{ auth.user.name.charAt(0) }}</span>
      </v-chip>
      <v-btn
        v-if="mdAndUp"
        variant="tonal"
        color="primary"
        class="me-2"
        prepend-icon="mdi-home-outline"
        @click="router.push('/dashboard')"
      >
        {{ t('admin.backApp') }}
      </v-btn>
    </template>
  </v-app-bar>

  <v-main class="admin-shell">
    <v-container class="admin-container py-4 py-md-6">
      <header class="admin-hero">
        <div class="admin-hero__icon" aria-hidden="true">
          <v-icon icon="mdi-shield-crown-outline" size="28" color="primary" />
        </div>
        <div class="admin-hero__text">
          <h1 class="cx-page-title">{{ t('admin.title') }}</h1>
          <p class="cx-page-sub">{{ t('admin.subtitle') }}</p>
        </div>
      </header>

      <nav class="admin-nav" :aria-label="t('admin.badge')">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="admin-nav__item"
          :class="{ 'admin-nav__item--on': activeKey === link.key }"
        >
          <v-icon :icon="link.icon" size="22" class="admin-nav__icon" />
          <span class="admin-nav__label">{{ t(`admin.nav.${link.key}`) }}</span>
        </RouterLink>
      </nav>

      <div class="admin-content">
        <router-view />
      </div>
    </v-container>
  </v-main>
</template>

<style scoped>
.admin-bar {
  background: color-mix(in srgb, var(--cx-bg) 88%, transparent) !important;
  backdrop-filter: blur(14px);
  border-bottom: none !important;
  box-shadow: none !important;
}
.admin-bar__title {
  min-width: 0;
}
.admin-bar__brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}
.admin-bar__logo :deep(.brand-logo__tagline) {
  display: none;
}
.admin-bar__logo :deep(.brand-logo__name) {
  font-size: 1.05rem;
}
.admin-shell {
  background: var(--cx-bg);
}
.admin-container {
  max-width: 920px;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
.admin-hero {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  margin-bottom: 1.15rem;
}
.admin-hero__icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--cx-primary-soft);
}
.admin-hero__text {
  min-width: 0;
}
.admin-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
  margin-bottom: 1.35rem;
}
@media (min-width: 700px) {
  .admin-nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.admin-nav__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
  min-height: 4.5rem;
  padding: 0.85rem 0.95rem;
  border-radius: var(--cx-radius);
  background: var(--cx-surface-soft);
  color: var(--cx-text);
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}
.admin-nav__item--on {
  background: color-mix(in srgb, var(--cx-primary) 26%, var(--cx-surface));
  color: var(--cx-primary-deep);
}
.admin-nav__icon {
  opacity: 0.9;
}
.admin-nav__label {
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.2;
}
.admin-content {
  min-width: 0;
}
</style>
