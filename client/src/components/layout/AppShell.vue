<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const links = [
  { to: '/dashboard', key: 'dashboard' },
  { to: '/meals', key: 'meals' },
  { to: '/water', key: 'water' },
  { to: '/mood', key: 'mood' },
  { to: '/sleep', key: 'sleep' },
  { to: '/habits', key: 'habits' },
]

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen pb-24 md:pb-8">
    <header class="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
      <RouterLink to="/dashboard" class="font-display text-2xl font-800 tracking-tight text-sage-dark">
        {{ t('app.name') }}
      </RouterLink>
      <div class="flex items-center gap-3">
        <RouterLink
          to="/profile"
          class="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-sm shadow-sm ring-1 ring-black/5"
        >
          <img
            v-if="auth.user?.avatar"
            :src="auth.user.avatar"
            alt=""
            class="h-7 w-7 rounded-full object-cover"
          />
          <span class="max-w-[120px] truncate text-ink">{{ auth.user?.name }}</span>
        </RouterLink>
        <button
          type="button"
          class="text-sm text-muted hover:text-ink"
          @click="logout"
        >
          {{ t('common.logout') }}
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4">
      <slot />
    </main>

    <nav
      class="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/90 backdrop-blur md:hidden"
    >
      <ul class="grid grid-cols-6 gap-1 px-1 py-2 text-[11px]">
        <li v-for="link in links" :key="link.to">
          <RouterLink
            :to="link.to"
            class="flex flex-col items-center rounded-xl px-1 py-1.5"
            :class="route.path === link.to ? 'bg-sage/15 text-sage-dark' : 'text-muted'"
          >
            {{ t(`nav.${link.key}`) }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <nav class="mx-auto mt-6 hidden max-w-5xl gap-2 px-4 md:flex">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-full px-4 py-2 text-sm transition"
        :class="
          route.path === link.to
            ? 'bg-sage text-white'
            : 'bg-white/70 text-ink ring-1 ring-black/5 hover:bg-sage-light/40'
        "
      >
        {{ t(`nav.${link.key}`) }}
      </RouterLink>
    </nav>
  </div>
</template>
