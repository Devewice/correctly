<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useRemindersStore } from '@/shared/reminders/useRemindersStore'
import { pushSupported, registerServiceWorker } from '@/shared/reminders/pushClient'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const reminders = useRemindersStore()

reminders.configure({
  messages: () => ({
    title: t('reminders.notifyTitle'),
    water: t('reminders.msg.water'),
    mood: t('reminders.msg.mood'),
    meals: t('reminders.msg.meals'),
    habits: t('reminders.msg.habits'),
    sleep: t('reminders.msg.sleep'),
    summary: t('reminders.msg.summary'),
    friends: t('reminders.msg.friends'),
    custom: t('reminders.msg.custom'),
  }),
  navigate: (path) => router.push(path),
  timezone: auth.user?.timezone || 'America/Bogota',
})

function onInApp(e) {
  reminders.showToast(e.detail)
}

function onSwMessage(event) {
  if (event.data?.type === 'correctly:navigate' && event.data.url) {
    router.push(event.data.url)
  }
}

onMounted(() => {
  window.addEventListener('correctly:reminder', onInApp)
  navigator.serviceWorker?.addEventListener('message', onSwMessage)
})

onUnmounted(() => {
  window.removeEventListener('correctly:reminder', onInApp)
  navigator.serviceWorker?.removeEventListener('message', onSwMessage)
  reminders.stop()
})

watch(
  () => auth.user?.id,
  (id) => {
    if (id) {
      reminders.configure({ timezone: auth.user.timezone || 'America/Bogota' })
      reminders.load(auth.user).catch(() => {})
      if (pushSupported() && Notification.permission === 'granted') {
        registerServiceWorker().catch(() => {})
      }
      reminders.refreshPushStatus().catch(() => {})
    } else {
      reminders.stop()
    }
  },
  { immediate: true },
)
</script>

<template>
  <v-snackbar
    :model-value="Boolean(reminders.toast)"
    color="primary-darken-1"
    timeout="8000"
    class="cx-snackbar"
    @update:model-value="(v) => !v && reminders.clearToast()"
  >
    {{ reminders.toast?.text }}
    <template #actions>
      <v-btn
        variant="text"
        class="text-white"
        @click="
          () => {
            const r = reminders.toast?.route
            reminders.clearToast()
            if (r) router.push(r)
          }
        "
      >
        {{ t('reminders.open') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>
