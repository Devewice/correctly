<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import BrandLogo from '@/shared/components/BrandLogo.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const moreOpen = ref(false)

const tab = computed(() => {
  if (route.path.startsWith('/profile')) return 'profile'
  if (route.path === '/dashboard' || route.path === '/') return 'today'
  return 'more'
})

const moreItems = computed(() => [
  { to: '/stats', title: t('nav.stats'), icon: 'mdi-chart-bar', hint: t('day.moreHints.stats') },
  { to: '/meditation', title: t('nav.meditation'), icon: 'mdi-meditation', hint: t('day.moreHints.meditation') },
  { to: '/activity', title: t('nav.activity'), icon: 'mdi-run', hint: t('day.moreHints.activity') },
  { to: '/weight', title: t('nav.weight'), icon: 'mdi-scale-bathroom', hint: t('day.moreHints.weight') },
  { to: '/sleep', title: t('nav.sleep'), icon: 'mdi-sleep', hint: t('day.moreHints.sleep') },
  { to: '/meals', title: t('nav.meals'), icon: 'mdi-food-apple', hint: t('day.moreHints.meals') },
  { to: '/water', title: t('nav.water'), icon: 'mdi-cup-water', hint: t('day.moreHints.water') },
  { to: '/mood', title: t('nav.mood'), icon: 'mdi-emoticon-outline', hint: t('day.moreHints.mood') },
  { to: '/habits', title: t('nav.habits'), icon: 'mdi-checkbox-marked-circle-outline', hint: t('day.moreHints.habits') },
])

function go(path) {
  moreOpen.value = false
  router.push(path)
}

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <v-app-bar elevation="0" height="64">
    <v-app-bar-title class="ms-2">
      <BrandLogo :size="36" />
    </v-app-bar-title>
    <template #append>
      <v-btn
        v-if="auth.user?.role === 'superadmin'"
        icon="mdi-shield-crown-outline"
        variant="text"
        to="/admin"
        :aria-label="t('admin.badge')"
      />
      <v-btn icon="mdi-logout-variant" variant="text" :aria-label="t('common.logout')" @click="logout" />
    </template>
  </v-app-bar>

  <v-main>
    <v-container class="py-4 py-sm-6" style="max-width: 560px">
      <router-view />
    </v-container>
  </v-main>

  <v-bottom-navigation :model-value="tab" grow app color="primary" elevation="8">
    <v-btn value="today" to="/dashboard" prepend-icon="mdi-white-balance-sunny">
      {{ t('nav.dashboard') }}
    </v-btn>
    <v-btn value="more" prepend-icon="mdi-dots-grid" @click="moreOpen = true">
      {{ t('nav.more') }}
    </v-btn>
    <v-btn value="profile" to="/profile" prepend-icon="mdi-account-circle-outline">
      {{ t('nav.profile') }}
    </v-btn>
  </v-bottom-navigation>

  <v-bottom-sheet v-model="moreOpen" inset>
    <v-card class="pa-4 pb-8">
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
        class="text-body-2 text-medium-emphasis mb-4"
      >
        {{ t('day.moreSubtitle') }}
      </p>
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
              <v-icon :icon="item.icon" color="primary" class="mb-2" />
              <div class="text-subtitle-2 font-weight-bold">{{ item.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.hint }}</div>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-bottom-sheet>
</template>

