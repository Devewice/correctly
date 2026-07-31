import { getPushStatus, pushSupported } from '@/shared/reminders/pushClient'
import { pwaInstalled } from '@/shared/pwa/installState'

/**
 * Detecta qué está apagado y hace falta activar para que Correctly funcione bien.
 * @param {{ hasEnabledReminders?: boolean }} opts
 * @returns {Promise<Array<{ id: string, severity: 'error'|'warning'|'info', action?: string }>>}
 */
export async function checkSystemHealth(opts = {}) {
  const issues = []
  const hasReminders = Boolean(opts.hasEnabledReminders)

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    issues.push({ id: 'offline', severity: 'warning' })
  }

  try {
    localStorage.setItem('correctly_health_ping', '1')
    localStorage.removeItem('correctly_health_ping')
  } catch {
    issues.push({ id: 'storage', severity: 'error' })
  }

  const swOk = 'serviceWorker' in navigator
  let swReady = false
  if (swOk) {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      swReady = Boolean(reg)
      if (!reg) {
        issues.push({ id: 'serviceWorker', severity: hasReminders ? 'warning' : 'info' })
      }
    } catch {
      issues.push({ id: 'serviceWorker', severity: 'warning' })
    }
  } else {
    issues.push({ id: 'serviceWorkerUnsupported', severity: 'warning' })
  }

  if (typeof Notification === 'undefined') {
    if (hasReminders) {
      issues.push({ id: 'notificationsUnsupported', severity: 'warning' })
    }
  } else if (Notification.permission === 'denied') {
    issues.push({
      id: 'notificationsDenied',
      severity: hasReminders ? 'error' : 'warning',
      action: 'reminders',
    })
  } else if (Notification.permission === 'default' && hasReminders) {
    issues.push({
      id: 'notificationsDefault',
      severity: 'warning',
      action: 'enableNotifications',
    })
  }

  const pushOk = pushSupported()
  if (hasReminders) {
    if (!pushOk) {
      issues.push({ id: 'pushUnsupported', severity: 'info', action: 'reminders' })
    } else {
      try {
        const status = await getPushStatus()
        if (!status.configured) {
          issues.push({ id: 'pushServer', severity: 'info', action: 'reminders' })
        } else if (!status.subscribed) {
          issues.push({
            id: 'pushNotSubscribed',
            severity: 'warning',
            action: 'enablePush',
          })
        }
      } catch {
        issues.push({ id: 'pushCheckFail', severity: 'info', action: 'reminders' })
      }
    }
  }

  const ios = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
  if (ios && hasReminders && !pwaInstalled.value && pushOk) {
    issues.push({ id: 'iosInstall', severity: 'warning', action: 'profile' })
  }

  // Si hay SW pero no está controlling (primera visita)
  if (swOk && swReady && !navigator.serviceWorker.controller && hasReminders) {
    issues.push({ id: 'swPending', severity: 'info', action: 'reload' })
  }

  return issues
}

const DISMISS_KEY = 'correctly_health_dismissed'

export function getDismissedIssues() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(DISMISS_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export function dismissIssue(id) {
  const set = getDismissedIssues()
  set.add(id)
  sessionStorage.setItem(DISMISS_KEY, JSON.stringify([...set]))
}
