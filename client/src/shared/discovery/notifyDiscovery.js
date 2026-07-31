import {
  markDiscoveryDone,
  setDiscoveryFlag,
} from '@/shared/discovery/discoveryPrefs'

/** Avisa al banner de discovery que debe reevaluar. */
export function pingDiscovery() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('correctly:discovery'))
  }
}

export function completeDiscoveryTip(userId, tipId, flag) {
  if (!userId) return
  markDiscoveryDone(userId, tipId)
  if (flag) setDiscoveryFlag(userId, flag, true)
  pingDiscovery()
}

export function flagDiscovery(userId, flag, value = true) {
  if (!userId) return
  setDiscoveryFlag(userId, flag, value)
  pingDiscovery()
}
