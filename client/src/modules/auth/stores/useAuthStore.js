import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, getToken, setToken } from '@/shared/api/client'
import { setLocale } from '@/plugins/i18n'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const authStatus = ref({ googleConfigured: false, devLogin: true })

  const isAuthenticated = computed(() => !!user.value)

  async function fetchStatus() {
    authStatus.value = await api('/auth/status')
  }

  async function fetchMe() {
    loading.value = true
    try {
      if (!getToken()) {
        user.value = null
        return null
      }
      const data = await api('/auth/me')
      user.value = data.user
      if (data.user?.language) setLocale(data.user.language)
      return data.user
    } catch {
      setToken(null)
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function devLogin(payload = {}) {
    const data = await api('/auth/dev-login', { method: 'POST', body: payload })
    setToken(data.token)
    user.value = data.user
    if (data.user?.language) setLocale(data.user.language)
    return data.user
  }

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' })
    } finally {
      setToken(null)
      user.value = null
    }
  }

  function bootstrapFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) return
    setToken(token)
    params.delete('token')
    const qs = params.toString()
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`
    window.history.replaceState({}, '', url)
  }

  return {
    user,
    loading,
    authStatus,
    isAuthenticated,
    fetchStatus,
    fetchMe,
    devLogin,
    logout,
    bootstrapFromUrl,
  }
})
