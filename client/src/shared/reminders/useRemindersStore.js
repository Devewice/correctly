import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/shared/api/client'
import { defaultReminders } from '@/shared/reminders/presets'
import {
  ensureNotificationPermission,
  notificationSupport,
  startReminderScheduler,
  stopReminderScheduler,
  updateReminderList,
} from '@/shared/reminders/scheduler'
import {
  getPushStatus,
  pushSupported,
  subscribeWebPush,
  unsubscribeWebPush,
} from '@/shared/reminders/pushClient'

export const useRemindersStore = defineStore('reminders', () => {
  const reminders = ref([])
  const permission = ref(notificationSupport())
  const busy = ref(false)
  const toast = ref(null)
  const started = ref(false)
  const push = ref({
    supported: pushSupported(),
    configured: false,
    subscribed: false,
    devices: 0,
  })

  let getMessages = () => ({})
  let navigate = null
  let timezone = 'America/Bogota'

  function configure({ messages, navigate: nav, timezone: tz }) {
    if (messages) getMessages = messages
    if (nav) navigate = nav
    if (tz) timezone = tz
  }

  function bootScheduler() {
    startReminderScheduler({
      list: reminders.value,
      timezone,
      messages: getMessages,
      navigate: (path) => navigate?.(path),
    })
  }

  async function load(user) {
    if (!user) {
      reminders.value = []
      stopReminderScheduler()
      started.value = false
      return
    }
    timezone = user.timezone || 'America/Bogota'
    const data = await api('/user/reminders')
    let list = Array.isArray(data.reminders) ? data.reminders : []
    if (!list.length) {
      list = defaultReminders(user.sleepTime || '23:00')
    }
    reminders.value = list
    bootScheduler()
    started.value = true
  }

  async function save(next, authStore) {
    busy.value = true
    try {
      const data = await api('/user/reminders', {
        method: 'PUT',
        body: { reminders: next },
      })
      reminders.value = data.reminders
      if (data.user && authStore) authStore.user = data.user
      updateReminderList(reminders.value)
      bootScheduler()
    } finally {
      busy.value = false
    }
  }

  async function refreshPushStatus() {
    push.value.supported = pushSupported()
    permission.value = notificationSupport()
    const status = await getPushStatus()
    push.value = {
      ...push.value,
      configured: Boolean(status.configured),
      subscribed: Boolean(status.subscribed),
      devices: status.devices || 0,
    }
    return push.value
  }

  async function enableWebNotifications() {
    permission.value = await ensureNotificationPermission()
    if (permission.value === 'granted' && pushSupported()) {
      const result = await subscribeWebPush()
      await refreshPushStatus()
      return result.ok ? 'granted' : permission.value
    }
    return permission.value
  }

  async function enableWebPush() {
    const result = await subscribeWebPush()
    permission.value = notificationSupport()
    await refreshPushStatus()
    return result
  }

  async function disableWebPush() {
    await unsubscribeWebPush()
    await refreshPushStatus()
  }

  function showToast(detail) {
    toast.value = { text: detail.body, route: detail.route }
  }

  function clearToast() {
    toast.value = null
  }

  function stop() {
    stopReminderScheduler()
    started.value = false
  }

  return {
    reminders,
    permission,
    busy,
    toast,
    started,
    push,
    configure,
    load,
    save,
    enableWebNotifications,
    enableWebPush,
    disableWebPush,
    refreshPushStatus,
    showToast,
    clearToast,
    stop,
  }
})
