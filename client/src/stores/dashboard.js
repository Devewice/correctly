import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const today = ref(null)
  const timeline = ref([])
  const insights = ref([])
  const loading = ref(false)

  async function loadAll(date) {
    loading.value = true
    try {
      const q = date ? `?date=${date}` : ''
      const [t, tl, ins] = await Promise.all([
        api(`/dashboard/today${q}`),
        api(`/dashboard/timeline${q}`),
        api('/dashboard/insights'),
      ])
      today.value = t
      timeline.value = tl.items
      insights.value = ins.insights
    } finally {
      loading.value = false
    }
  }

  return { today, timeline, insights, loading, loadAll }
})
