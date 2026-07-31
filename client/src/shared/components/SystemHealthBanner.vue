<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useRemindersStore } from '@/shared/reminders/useRemindersStore'
import {
  checkSystemHealth,
  dismissIssue,
  getDismissedIssues,
} from '@/shared/system/checkSystemHealth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const reminders = useRemindersStore()

const issues = ref([])
const busy = ref(false)
const open = ref(true)

const hasEnabledReminders = computed(() =>
  reminders.reminders.some((r) => r.enabled),
)

const visible = computed(() => {
  const dismissed = getDismissedIssues()
  return issues.value.filter((i) => !dismissed.has(i.id))
})

const primary = computed(() => visible.value[0] || null)
const moreCount = computed(() => Math.max(0, visible.value.length - 1))

async function refresh() {
  if (!auth.user) {
    issues.value = []
    return
  }
  issues.value = await checkSystemHealth({
    hasEnabledReminders: hasEnabledReminders.value,
  })
  open.value = visible.value.length > 0
}

async function runAction(issue) {
  if (!issue) return
  busy.value = true
  try {
    if (issue.action === 'enableNotifications' || issue.id === 'notificationsDefault') {
      await reminders.enableWebNotifications()
    } else if (issue.action === 'enablePush' || issue.id === 'pushNotSubscribed') {
      await reminders.enableWebPush()
    } else if (issue.action === 'reminders') {
      await router.push('/reminders')
    } else if (issue.action === 'profile') {
      await router.push('/profile')
    } else if (issue.action === 'reload') {
      window.location.reload()
      return
    }
    await refresh()
  } finally {
    busy.value = false
  }
}

function skip(issue) {
  if (!issue) return
  dismissIssue(issue.id)
  open.value = visible.value.length > 0
}

function onOnline() {
  refresh()
}

onMounted(() => {
  refresh()
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOnline)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh()
  })
})

onUnmounted(() => {
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOnline)
})

watch(
  () => [auth.user?.id, hasEnabledReminders.value, reminders.push.subscribed],
  () => refresh(),
)

function titleFor(id) {
  return t(`health.issues.${id}.title`)
}

function bodyFor(id) {
  return t(`health.issues.${id}.body`)
}

function actionLabel(issue) {
  if (!issue?.action) return t('health.gotIt')
  if (issue.action === 'enableNotifications') return t('health.actions.enableNotifications')
  if (issue.action === 'enablePush') return t('health.actions.enablePush')
  if (issue.action === 'reminders') return t('health.actions.openReminders')
  if (issue.action === 'profile') return t('health.actions.openProfile')
  if (issue.action === 'reload') return t('health.actions.reload')
  return t('health.gotIt')
}

const alertType = computed(() => {
  if (!primary.value) return 'info'
  if (primary.value.severity === 'error') return 'error'
  if (primary.value.severity === 'warning') return 'warning'
  return 'info'
})
</script>

<template>
  <v-alert
    v-if="primary && open"
    :type="alertType"
    variant="tonal"
    class="mb-4 health-banner"
    density="comfortable"
  >
    <div class="health-banner__title">{{ titleFor(primary.id) }}</div>
    <div class="health-banner__body">{{ bodyFor(primary.id) }}</div>
    <div v-if="moreCount" class="health-banner__more">
      {{ t('health.moreIssues', { n: moreCount }) }}
    </div>
    <div class="health-banner__actions">
      <v-btn
        v-if="primary.action"
        size="small"
        color="primary"
        :loading="busy"
        @click="runAction(primary)"
      >
        {{ actionLabel(primary) }}
      </v-btn>
      <v-btn size="small" variant="text" :disabled="busy" @click="skip(primary)">
        {{ t('health.later') }}
      </v-btn>
      <v-btn size="small" variant="text" :loading="busy" @click="refresh">
        {{ t('health.recheck') }}
      </v-btn>
    </div>
  </v-alert>
</template>

<style scoped>
.health-banner__title {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}
.health-banner__body {
  font-size: 0.8rem;
  line-height: 1.4;
  opacity: 0.92;
  margin-bottom: 0.45rem;
}
.health-banner__more {
  font-size: 0.75rem;
  opacity: 0.75;
  margin-bottom: 0.5rem;
}
.health-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
</style>
