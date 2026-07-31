import { loadCarePrefs } from '@/shared/utils/carePrefs'
import { loadThemeMode } from '@/shared/theme/themePrefs'
import { loadDiscovery } from '@/shared/discovery/discoveryPrefs'
import { listDiscoveryTips } from '@/shared/discovery/features'
import { getPushStatus, pushSupported } from '@/shared/reminders/pushClient'

/**
 * Construye contexto y lista tips visibles para el usuario.
 * @param {{ user?: object|null, hasEnabledReminders?: boolean }} opts
 */
export async function evaluateDiscovery(opts = {}) {
  const user = opts.user || null
  if (!user?.id || !user.onboardingCompleted) return []

  const disc = loadDiscovery(user.id)
  const care = loadCarePrefs(user.id)

  let pushSubscribed = false
  let notificationPermission = 'default'
  try {
    if (typeof Notification !== 'undefined') {
      notificationPermission = Notification.permission
    }
    if (pushSupported()) {
      const status = await getPushStatus()
      pushSubscribed = Boolean(status.subscribed)
    }
  } catch {
    /* ignore */
  }

  const ctx = {
    user,
    flags: disc.flags,
    themeMode: loadThemeMode(),
    companionPetId: care.companionPetId,
    pushSubscribed,
    notificationPermission,
    hasEnabledReminders: Boolean(opts.hasEnabledReminders),
    hour: new Date().getHours(),
  }

  return listDiscoveryTips(ctx, {
    done: disc.done,
    snoozeUntil: disc.snoozeUntil,
  })
}
