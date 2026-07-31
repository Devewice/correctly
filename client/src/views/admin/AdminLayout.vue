<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const links = [
  { to: '/admin', key: 'overview', exact: true },
  { to: '/admin/google', key: 'google' },
  { to: '/admin/users', key: 'users' },
]

function back() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-bg pb-16">
    <header class="border-b border-black/5 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-sage">
            {{ t('admin.badge') }}
          </p>
          <h1 class="font-display text-2xl font-extrabold text-ink">
            {{ t('admin.title') }}
          </h1>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <span class="text-muted">{{ auth.user?.name }}</span>
          <button type="button" class="rounded-full bg-sand px-3 py-1.5" @click="back">
            {{ t('admin.backApp') }}
          </button>
        </div>
      </div>
      <nav class="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-4 py-1.5 text-sm whitespace-nowrap"
          :class="
            (link.exact ? route.path === link.to : route.path.startsWith(link.to))
              ? 'bg-sage text-white'
              : 'bg-white text-muted ring-1 ring-black/5'
          "
        >
          {{ t(`admin.nav.${link.key}`) }}
        </RouterLink>
      </nav>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
