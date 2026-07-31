import { computed } from 'vue'

/** Decide la siguiente pregunta del día según lo ya registrado */
export function useDayGuide(todayRef) {
  const steps = computed(() => {
    const today = todayRef.value
    if (!today) return []

    const out = []
    const mood = today.summary?.latestMood
    const water = today.summary?.waterMl || 0
    const meals = today.summary?.mealsCount || 0
    const habits = today.habits || []
    const pendingHabits = habits.filter((h) => !h.completedToday)

    if (!mood) {
      out.push({ id: 'mood', key: 'mood' })
    }
    if (water < 500) {
      out.push({ id: 'water', key: 'water', water })
    }
    if (meals < 1) {
      out.push({ id: 'meal', key: 'meal' })
    }
    for (const habit of pendingHabits.slice(0, 3)) {
      out.push({ id: `habit-${habit.id}`, key: 'habit', habit })
    }
    if (!out.length) {
      out.push({ id: 'done', key: 'done' })
    }
    return out
  })

  const suggestedMealType = computed(() => {
    const h = new Date().getHours()
    if (h < 11) return 'breakfast'
    if (h < 15) return 'lunch'
    if (h < 18) return 'snack'
    if (h < 22) return 'dinner'
    return 'night_snack'
  })

  return { steps, suggestedMealType }
}
