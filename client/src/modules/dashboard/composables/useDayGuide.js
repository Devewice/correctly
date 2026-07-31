import { computed, unref } from 'vue'
import {
  activeModuleSet,
  dayBand,
  mealTypeForBand,
  nowMinutes,
} from '@/shared/utils/timeContext'
import { ritualById } from '@/shared/data/rituals'

/**
 * Motor de guía «Hoy»: un paso prioritario según franja, módulos, skips,
 * energía baja y ritual activo.
 * @param {import('vue').Ref} todayRef
 * @param {import('vue').Ref|import('vue').ComputedRef} userRef
 * @param {import('vue').Ref} skippedRef Set<string>
 * @param {import('vue').Ref|import('vue').ComputedRef} [prefsRef] { lowEnergy, ritualId }
 */
export function useDayGuide(todayRef, userRef, skippedRef, prefsRef) {
  const band = computed(() =>
    dayBand(userRef.value?.wakeTime, userRef.value?.sleepTime, nowMinutes()),
  )

  const modules = computed(() => activeModuleSet(userRef.value))

  const suggestedMealType = computed(() => {
    const times = userRef.value?.mealTimes || {}
    return mealTypeForBand(band.value, times)
  })

  const prefs = computed(() => unref(prefsRef) || { lowEnergy: false, ritualId: null })

  const caredFor = computed(() => {
    const today = todayRef.value
    if (!today?.summary) return []
    const s = today.summary
    const out = []
    if (s.latestMood) out.push('mood')
    if ((s.waterMl || 0) > 0) out.push('water')
    if ((s.mealsCount || 0) > 0) out.push('meals')
    if (s.sleep) out.push('sleep')
    if ((s.habitsDone || 0) > 0) out.push('habits')
    if ((s.activitiesCount || 0) > 0) out.push('activity')
    if ((s.meditationMin || 0) > 0) out.push('meditation')
    if ((s.journalCount || 0) > 0) out.push('journal')
    return out
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
    const lowEnergy = Boolean(prefs.value.lowEnergy)
    const ritual = ritualById(prefs.value.ritualId)

    const waterTarget = lowEnergy
      ? b === 'morning'
        ? 200
        : 500
      : b === 'morning'
        ? 300
        : b === 'midday'
          ? 800
          : b === 'afternoon'
            ? 1200
            : b === 'evening'
              ? 1500
              : 200

    /** @type {Array<{ id: string, key: string, priority: number, [k: string]: any }>} */
    const candidates = []

    function push(step, priority) {
      if (skipped.has(step.id)) return
      let p = priority
      if (ritual?.bands.includes(b) && ritual.stepKeys.includes(step.key)) {
        p = Math.max(1, p - 12)
      }
      candidates.push({ ...step, priority: p })
    }

    if (b === 'rest') {
      // De madrugada: sigue ofreciendo acciones útiles (no solo un mensaje)
      if (mods.has('sleep') && !hasSleep) push({ id: 'sleep', key: 'sleep' }, 10)
      if (mods.has('water') && water < 400) push({ id: 'water', key: 'water', water }, 15)
      if (mods.has('mood') && !hasMood) push({ id: 'mood', key: 'mood' }, 25)
      if (mods.has('journal') && !hasJournal) push({ id: 'journal', key: 'journal' }, 40)
      if (!candidates.length) push({ id: 'rest', key: 'rest' }, 100)
    } else {
      if (mods.has('mood') && !hasMood && (b === 'morning' || b === 'midday')) {
        push({ id: 'mood', key: 'mood' }, b === 'morning' ? 5 : 25)
      }
      if (mods.has('mood') && !hasMood && (b === 'afternoon' || b === 'evening')) {
        push({ id: 'mood', key: 'mood' }, lowEnergy ? 50 : 40)
      }

      if (mods.has('water') && water < waterTarget) {
        push({ id: 'water', key: 'water', water }, b === 'morning' ? 15 : 20)
      }

      if (mods.has('meals') && !mealTypes.has(mealType) && !lowEnergy) {
        const mealPri = b === 'morning' || b === 'midday' || b === 'evening' ? 18 : 35
        push({ id: `meal-${mealType}`, key: 'meal', mealType }, mealPri)
      } else if (mods.has('meals') && !mealTypes.has(mealType) && lowEnergy && (b === 'midday' || b === 'evening')) {
        push({ id: `meal-${mealType}`, key: 'meal', mealType }, 22)
      }

      if (mods.has('habits') && habits.length && (!lowEnergy || b === 'morning')) {
        const habit = habits[0]
        push({ id: `habit-${habit.id}`, key: 'habit', habit }, b === 'morning' ? 30 : 28)
      }

      if (mods.has('activity') && !hasActivity && (b === 'midday' || b === 'afternoon') && !lowEnergy) {
        push({ id: 'activity', key: 'activity' }, 32)
      }

      if (
        mods.has('meditation') &&
        !hasMeditation &&
        (b === 'afternoon' || b === 'evening') &&
        !lowEnergy
      ) {
        push({ id: 'meditation', key: 'meditation' }, 34)
      }

      if (mods.has('sleep') && !hasSleep && b === 'evening') {
        push({ id: 'sleep', key: 'sleep' }, 22)
      }

      if (mods.has('sleep') && !hasSleep && b === 'morning') {
        push({ id: 'sleep', key: 'sleep' }, 12)
      }

      if (
        mods.has('journal') &&
        !hasJournal &&
        (b === 'evening' || b === 'afternoon') &&
        !lowEnergy
      ) {
        push({ id: 'journal', key: 'journal' }, 38)
      }
    }

    candidates.sort((a, c) => a.priority - c.priority)

    if (!candidates.length) {
      return [{ id: 'done', key: 'done', priority: 999 }]
    }

    // Energía baja: solo el paso más urgente (máx. 1 en cola)
    if (lowEnergy) {
      return [candidates[0]]
    }

    return [candidates[0]]
  })

  return { steps, suggestedMealType, band, modules, caredFor }
}
