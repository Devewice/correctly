import { computed } from 'vue'
import {
  activeModuleSet,
  dayBand,
  mealTypeForBand,
  nowMinutes,
} from '@/shared/utils/timeContext'

/**
 * Motor de guía «Hoy»: un paso prioritario según franja, módulos y skips.
 * @param {import('vue').Ref} todayRef
 * @param {import('vue').Ref|import('vue').ComputedRef} userRef
 * @param {import('vue').Ref} skippedRef Set<string>
 */
export function useDayGuide(todayRef, userRef, skippedRef) {
  const band = computed(() =>
    dayBand(userRef.value?.wakeTime, userRef.value?.sleepTime, nowMinutes()),
  )

  const modules = computed(() => activeModuleSet(userRef.value))

  const suggestedMealType = computed(() => {
    const times = userRef.value?.mealTimes || {}
    return mealTypeForBand(band.value, times)
  })

  const steps = computed(() => {
    const today = todayRef.value
    if (!today) return []

    const skipped = skippedRef?.value || new Set()
    const mods = modules.value
    const b = band.value
    const summary = today.summary || {}
    const water = summary.waterMl || 0
    const meals = today.meals || []
    const mealTypes = new Set(meals.map((m) => m.type))
    const habits = (today.habits || []).filter((h) => !h.completedToday)
    const hasMood = Boolean(summary.latestMood)
    const hasSleep = Boolean(summary.sleep)
    const hasActivity = (summary.activitiesCount || 0) > 0
    const hasMeditation = (summary.meditationMin || 0) > 0
    const hasJournal = (summary.journalCount || 0) > 0
    const mealType = suggestedMealType.value

    const waterTarget =
      b === 'morning' ? 300 : b === 'midday' ? 800 : b === 'afternoon' ? 1200 : b === 'evening' ? 1500 : 200

    /** @type {Array<{ id: string, key: string, priority: number, [k: string]: any }>} */
    const candidates = []

    function push(step, priority) {
      if (skipped.has(step.id)) return
      candidates.push({ ...step, priority })
    }

    if (b === 'rest') {
      if (mods.has('sleep') && !hasSleep) {
        push({ id: 'sleep', key: 'sleep' }, 10)
      }
      if (mods.has('water') && water < 200) {
        push({ id: 'water', key: 'water', water }, 20)
      }
      if (!candidates.length) {
        push({ id: 'rest', key: 'rest' }, 100)
      }
    } else {
      // Mañana: ánimo primero
      if (mods.has('mood') && !hasMood && (b === 'morning' || b === 'midday')) {
        push({ id: 'mood', key: 'mood' }, b === 'morning' ? 5 : 25)
      }
      if (mods.has('mood') && !hasMood && (b === 'afternoon' || b === 'evening')) {
        push({ id: 'mood', key: 'mood' }, 40)
      }

      if (mods.has('water') && water < waterTarget) {
        push({ id: 'water', key: 'water', water }, b === 'morning' ? 15 : 20)
      }

      if (mods.has('meals') && !mealTypes.has(mealType)) {
        const mealPri =
          b === 'morning' || b === 'midday' || b === 'evening' ? 18 : 35
        push({ id: `meal-${mealType}`, key: 'meal', mealType }, mealPri)
      }

      if (mods.has('habits') && habits.length) {
        const habit = habits[0]
        push(
          { id: `habit-${habit.id}`, key: 'habit', habit },
          b === 'morning' ? 30 : 28,
        )
      }

      if (mods.has('activity') && !hasActivity && (b === 'midday' || b === 'afternoon')) {
        push({ id: 'activity', key: 'activity' }, 32)
      }

      if (
        mods.has('meditation') &&
        !hasMeditation &&
        (b === 'afternoon' || b === 'evening')
      ) {
        push({ id: 'meditation', key: 'meditation' }, 34)
      }

      if (mods.has('sleep') && !hasSleep && b === 'evening') {
        push({ id: 'sleep', key: 'sleep' }, 22)
      }

      // Sueño de anoche pendiente a la mañana
      if (mods.has('sleep') && !hasSleep && b === 'morning') {
        push({ id: 'sleep', key: 'sleep' }, 12)
      }

      if (
        mods.has('journal') &&
        !hasJournal &&
        (b === 'evening' || b === 'afternoon')
      ) {
        push({ id: 'journal', key: 'journal' }, 38)
      }
    }

    candidates.sort((a, b) => a.priority - b.priority)

    if (!candidates.length) {
      return [{ id: 'done', key: 'done', priority: 999 }]
    }

    // Un solo paso prioritario (+ done no se mezcla)
    return [candidates[0]]
  })

  return { steps, suggestedMealType, band, modules }
}
