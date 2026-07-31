/**
 * Registry de novedades / guías para cuentas que aún no las vieron o configuraron.
 *
 * Cómo ampliar al shippear algo nuevo:
 * 1. Añade un objeto aquí con `id` estable.
 * 2. Strings en locales: discovery.tips.<id>.title / .body / .cta
 * 3. Opcional: marca done/flag desde el sitio donde el usuario configura esa cosa
 *    (markDiscoveryDone / setDiscoveryFlag).
 *
 * `when(ctx)` → true si aún hay que mostrarlo (además de done/snooze).
 * `priority` menor = más urgente.
 */

/**
 * @typedef {object} DiscoveryContext
 * @property {object|null} user
 * @property {Record<string, boolean|string|number>} flags
 * @property {string} themeMode
 * @property {string} companionPetId
 * @property {boolean} pushSubscribed
 * @property {string} notificationPermission
 * @property {boolean} hasEnabledReminders
 * @property {number} hour
 */

/** @type {Array<{
 *   id: string,
 *   priority: number,
 *   route?: string,
 *   when: (ctx: DiscoveryContext) => boolean,
 * }>} */
export const DISCOVERY_FEATURES = [
  {
    id: 'companions',
    priority: 10,
    route: '/profile',
    when: (ctx) => !ctx.flags.companionChosen,
  },
  {
    id: 'theme',
    priority: 20,
    route: '/profile',
    when: (ctx) => !ctx.flags.themeExplored,
  },
  {
    id: 'friends',
    priority: 30,
    route: '/friends',
    when: (ctx) => !ctx.flags.friendsVisited,
  },
  {
    id: 'nudges',
    priority: 35,
    route: '/friends',
    when: (ctx) => Boolean(ctx.flags.friendsVisited) && !ctx.flags.nudgeExplored,
  },
  {
    id: 'reminders',
    priority: 40,
    route: '/reminders',
    when: (ctx) => !ctx.flags.remindersVisited && !ctx.hasEnabledReminders,
  },
]

export function listDiscoveryTips(ctx, { done = {}, snoozeUntil = {} } = {}) {
  const now = Date.now()
  return DISCOVERY_FEATURES.filter((f) => {
    if (done[f.id]) return false
    const until = snoozeUntil[f.id]
    if (typeof until === 'number' && until > now) return false
    try {
      return Boolean(f.when(ctx))
    } catch {
      return false
    }
  }).sort((a, b) => a.priority - b.priority)
}
