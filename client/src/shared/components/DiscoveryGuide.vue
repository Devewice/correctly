<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useRemindersStore } from '@/shared/reminders/useRemindersStore'
import { evaluateDiscovery } from '@/shared/discovery/evaluateDiscovery'
import {
  markDiscoveryDone,
  setDiscoveryFlag,
  snoozeDiscovery,
} from '@/shared/discovery/discoveryPrefs'

const { t, te } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const reminders = useRemindersStore()

const tips = ref([])
const busy = ref(false)
const open = ref(true)

const hasEnabledReminders = computed(() =>
  reminders.reminders.some((r) => r.enabled),
)

const primary = computed(() => tips.value[0] || null)
const moreCount = computed(() => Math.max(0, tips.value.length - 1))

async function refresh() {
  if (!auth.user?.onboardingCompleted) {
    tips.value = []
    return
  }
  tips.value = await evaluateDiscovery({
    user: auth.user,
    hasEnabledReminders: hasEnabledReminders.value,
  })
  open.value = tips.value.length > 0
}

function trackRoute(path) {
  const uid = auth.user?.id
  if (!uid) return
  if (path.startsWith('/friends')) {
    setDiscoveryFlag(uid, 'friendsVisited', true)
    // Si ya está en amigos, el tip de lista ya no hace falta
    markDiscoveryDone(uid, 'friends')
  }
  if (path.startsWith('/reminders')) {
    setDiscoveryFlag(uid, 'remindersVisited', true)
    markDiscoveryDone(uid, 'reminders')
  }
  if (path.startsWith('/profile')) {
    // No auto-completa theme/companions: hace falta interacción
  }
}

async function goPrimary() {
  const tip = primary.value
  if (!tip) return
  busy.value = true
  try {
    if (tip.route) await router.push(tip.route)
    // Completar tips de “visitar”; los de configurar se cierran al configurar
    if (tip.id === 'friends' || tip.id === 'reminders' || tip.id === 'nudges') {
      markDiscoveryDone(auth.user.id, tip.id)
      if (tip.id === 'nudges') setDiscoveryFlag(auth.user.id, 'nudgeExplored', true)
    }
    await refresh()
  } finally {
    busy.value = false
  }
}

function later() {
  const tip = primary.value
  if (!tip || !auth.user?.id) return
  snoozeDiscovery(auth.user.id, tip.id, 7)
  refresh()
}

function dismissForGood() {
  const tip = primary.value
  if (!tip || !auth.user?.id) return
  markDiscoveryDone(auth.user.id, tip.id)
  refresh()
}

function titleFor(id) {
  const k = `discovery.tips.${id}.title`
  return te(k) ? t(k) : id
}

function bodyFor(id) {
  const k = `discovery.tips.${id}.body`
  return te(k) ? t(k) : ''
}

function ctaFor(id) {
  const k = `discovery.tips.${id}.cta`
  return te(k) ? t(k) : t('discovery.open')
}

watch(
  () => route.path,
  (path) => {
    trackRoute(path)
    refresh()
  },
)

watch(
  () => [auth.user?.id, auth.user?.onboardingCompleted, hasEnabledReminders.value],
  () => refresh(),
)

onMounted(() => {
  trackRoute(route.path)
  refresh()
  window.addEventListener('correctly:discovery', refresh)
})

onUnmounted(() => {
  window.removeEventListener('correctly:discovery', refresh)
})

/** Otros módulos pueden disparar `window.dispatchEvent(new Event('correctly:discovery'))` */
</script>

<template>
  <v-alert
    v-if="primary && open"
    type="info"
    variant="tonal"
    class="mb-4 discovery-guide"
    density="comfortable"
    icon="mdi-lightbulb-on-outline"
  >
    <div class="discovery-guide__eyebrow">{{ t('discovery.eyebrow') }}</div>
    <div class="discovery-guide__title">{{ titleFor(primary.id) }}</div>
    <div class="discovery-guide__body">{{ bodyFor(primary.id) }}</div>
    <div v-if="moreCount" class="discovery-guide__more">
      {{ t('discovery.more', { n: moreCount }) }}
    </div>
    <div class="discovery-guide__actions">
      <v-btn size="small" color="primary" :loading="busy" @click="goPrimary">
        {{ ctaFor(primary.id) }}
      </v-btn>
      <v-btn size="small" variant="text" :disabled="busy" @click="later">
        {{ t('discovery.later') }}
      </v-btn>
      <v-btn size="small" variant="text" :disabled="busy" @click="dismissForGood">
        {{ t('discovery.dismiss') }}
      </v-btn>
    </div>
  </v-alert>
</template>

<style scoped>
.discovery-guide__eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 0.2rem;
}
.discovery-guide__title {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}
.discovery-guide__body {
  font-size: 0.8rem;
  line-height: 1.4;
  opacity: 0.92;
  margin-bottom: 0.45rem;
}
.discovery-guide__more {
  font-size: 0.75rem;
  opacity: 0.75;
  margin-bottom: 0.5rem;
}
.discovery-guide__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
</style>
