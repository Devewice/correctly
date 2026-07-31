<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fadeUp, moodHover, softHover, withDelay } from '@/shared/motion/presets'
import { WATER_OPTIONS, glassesFromMl } from '@/shared/utils/water'
import GuideStepIcon from '@/modules/dashboard/components/GuideStepIcon.vue'
import { tAsk, pickVariantIndex } from '@/shared/utils/askVariants'
import { JOURNAL_PROMPTS } from '@/shared/data/journalPrompts'

const props = defineProps({
  step: { type: Object, required: true },
  mealType: { type: String, default: 'breakfast' },
  dateKey: { type: String, default: '' },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits([
  'mood',
  'water',
  'meal',
  'habit',
  'sleep',
  'meditation',
  'activity',
  'journal',
  'skip',
])
const { t } = useI18n()

const moods = [
  { value: 1, emoji: '😢', key: 'awful' },
  { value: 2, emoji: '😕', key: 'low' },
  { value: 3, emoji: '😐', key: 'ok' },
  { value: 4, emoji: '🙂', key: 'good' },
  { value: 5, emoji: '😄', key: 'great' },
]

const sleepOpts = [
  { key: 'great', quality: 5, hours: 8 },
  { key: 'ok', quality: 3, hours: 6.5 },
  { key: 'rough', quality: 2, hours: 5 },
]

const mealText = ref('')
const journalText = ref('')
const selectedMood = ref(null)

const askTitle = computed(() => {
  const key = props.step.key
  const map = {
    mood: 'day.moodAsk',
    water: 'day.waterAsk',
    meal: 'day.mealAsk',
    habit: 'day.habitAsk',
    sleep: 'day.sleepAsk',
    meditation: 'day.meditationAsk',
    activity: 'day.activityAsk',
    journal: 'day.journalAsk',
    rest: 'day.restTitle',
    done: 'day.doneTitle',
  }
  const base = map[key] || 'day.doneTitle'
  if (key === 'rest' || key === 'done') return t(base)
  return tAsk(t, base, props.dateKey, 3)
})

const journalPrompt = computed(() => {
  const i = pickVariantIndex(props.dateKey, 'journal-prompt', JOURNAL_PROMPTS.length)
  return JOURNAL_PROMPTS[i]
})

const contextLine = computed(() => {
  const s = props.step
  if (s.key === 'water') {
    return (s.water || 0) > 0
      ? t('day.waterNow', { glasses: glassesFromMl(s.water) })
      : t('day.waterNowEmpty')
  }
  if (s.key === 'meal') {
    return t('day.mealHint', { type: t(`meals.types.${s.mealType || props.mealType}`) })
  }
  if (s.key === 'done') return t('day.doneHint')
  if (s.key === 'rest') return t('day.restHint')
  return ''
})

watch(
  () => props.step.id,
  () => {
    selectedMood.value = null
    mealText.value = ''
    journalText.value = ''
  },
)

function saveMood() {
  if (!selectedMood.value) return
  emit('mood', selectedMood.value)
}

function saveMeal() {
  if (!mealText.value.trim()) return
  const type = props.step.mealType || props.mealType
  emit('meal', { type, description: mealText.value.trim() })
  mealText.value = ''
}

function saveJournal() {
  if (!journalText.value.trim()) return
  emit('journal', journalText.value.trim())
  journalText.value = ''
}

function pickMood(value) {
  selectedMood.value = value
}
</script>

<template>
  <v-card
    v-motion
    :initial="{ opacity: 0, y: 20, scale: 0.98 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 160, damping: 18 },
    }"
    class="day-guide-card cx-card-shell"
    variant="flat"
  >
    <div class="guide-head">
      <GuideStepIcon :kind="step.key === 'done' ? 'done' : step.key" size="sm" />
      <div class="guide-head__text">
        <h2 class="guide-head__title">{{ askTitle }}</h2>
        <p v-if="contextLine" class="guide-head__context">{{ contextLine }}</p>
      </div>
    </div>

    <template v-if="step.key === 'mood'">
      <v-row dense class="mb-3">
        <v-col v-for="(m, i) in moods" :key="m.value" cols="4" sm>
          <div v-motion v-bind="{ ...moodHover, ...withDelay(fadeUp, 80 + i * 40) }">
            <button
              type="button"
              class="mood-tile"
              :class="{ 'mood-tile--selected': selectedMood === m.value }"
              :disabled="busy"
              @click="pickMood(m.value)"
            >
              <span class="mood-tile__emoji" aria-hidden="true">{{ m.emoji }}</span>
              <span class="mood-tile__label">{{ t(`mood.labels.${m.key}`) }}</span>
            </button>
          </div>
        </v-col>
      </v-row>
      <v-btn
        block
        color="primary"
        size="large"
        :disabled="!selectedMood"
        :loading="busy"
        @click="saveMood"
      >
        {{ t('day.continue') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'water'">
      <v-row dense class="mb-2">
        <v-col v-for="(opt, i) in WATER_OPTIONS.slice(0, 2)" :key="opt.ml" cols="6">
          <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 80 + i * 50) }">
            <v-btn
              block
              color="info"
              variant="tonal"
              size="large"
              :loading="busy"
              @click="emit('water', opt.ml)"
            >
              {{ opt.key === 'sip' ? t('day.waterSip') : t('day.waterGlass') }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-btn variant="text" block class="guide-skip" @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'meal'">
      <v-text-field
        v-model="mealText"
        :label="t('meals.description')"
        autofocus
        class="mb-3"
        @keyup.enter="saveMeal"
      />
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-1"
        :disabled="!mealText.trim()"
        :loading="busy"
        @click="saveMeal"
      >
        {{ t('day.continue') }}
      </v-btn>
      <v-btn variant="text" block class="guide-skip" @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'habit'">
      <div class="habit-focus mb-3">
        <span class="habit-focus__icon" aria-hidden="true">{{ step.habit.icon }}</span>
        <span class="habit-focus__name">{{ step.habit.name }}</span>
      </div>
      <v-btn
        block
        color="success"
        size="large"
        class="mb-1"
        :loading="busy"
        @click="emit('habit', step.habit)"
      >
        {{ t('day.habitDone') }}
      </v-btn>
      <v-btn variant="text" block class="guide-skip" @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'sleep'">
      <v-row dense class="mb-2">
        <v-col v-for="opt in sleepOpts" :key="opt.key" cols="4">
          <button
            type="button"
            class="mood-tile"
            :disabled="busy"
            @click="emit('sleep', opt)"
          >
            <span class="mood-tile__emoji" aria-hidden="true">
              {{ opt.key === 'great' ? '😴' : opt.key === 'ok' ? '😐' : '😩' }}
            </span>
            <span class="mood-tile__label">{{ t(`sleep.feel.${opt.key}`) }}</span>
          </button>
        </v-col>
      </v-row>
      <v-btn variant="text" block class="guide-skip" @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'meditation'">
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-1"
        :loading="busy"
        @click="emit('meditation', 3)"
      >
        {{ t('day.meditationQuick') }}
      </v-btn>
      <div class="guide-actions">
        <v-btn variant="text" size="small" to="/meditation">{{ t('day.meditationOpen') }}</v-btn>
        <v-btn variant="text" size="small" class="guide-skip" @click="emit('skip')">
          {{ t('day.skip') }}
        </v-btn>
      </div>
    </template>

    <template v-else-if="step.key === 'activity'">
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-1"
        :loading="busy"
        @click="emit('activity', { type: 'walk', duration: 15, intensity: 'light' })"
      >
        {{ t('day.activityQuick') }}
      </v-btn>
      <div class="guide-actions">
        <v-btn variant="text" size="small" to="/activity">{{ t('day.activityOpen') }}</v-btn>
        <v-btn variant="text" size="small" class="guide-skip" @click="emit('skip')">
          {{ t('day.skip') }}
        </v-btn>
      </div>
    </template>

    <template v-else-if="step.key === 'journal'">
      <button
        type="button"
        class="select-tile mb-3"
        style="justify-content: flex-start"
        @click="journalText = t(`journal.prompts.${journalPrompt.key}`)"
      >
        <span class="me-2" aria-hidden="true">{{ journalPrompt.icon }}</span>
        {{ t(`journal.prompts.${journalPrompt.key}`) }}
      </button>
      <v-textarea
        v-model="journalText"
        rows="2"
        auto-grow
        :label="t('journal.line')"
        class="mb-3"
      />
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-1"
        :disabled="!journalText.trim()"
        :loading="busy"
        @click="saveJournal"
      >
        {{ t('day.continue') }}
      </v-btn>
      <v-btn variant="text" block class="guide-skip" @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'rest'">
      <v-row dense class="mb-2">
        <v-col cols="6">
          <v-btn
            block
            color="info"
            variant="tonal"
            size="large"
            :loading="busy"
            @click="emit('water', 250)"
          >
            {{ t('day.waterGlass') }}
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn color="primary" variant="tonal" block size="large" to="/sleep">
            {{ t('day.seeSleep') }}
          </v-btn>
        </v-col>
      </v-row>
      <v-btn variant="text" block to="/mood">{{ t('modules.mood') }}</v-btn>
    </template>

    <template v-else>
      <v-row dense class="mb-2">
        <v-col cols="6">
          <v-btn
            block
            color="info"
            variant="tonal"
            :loading="busy"
            @click="emit('water', 250)"
          >
            {{ t('day.waterGlass') }}
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn color="primary" variant="tonal" block to="/stats" prepend-icon="mdi-chart-bar">
            {{ t('day.seeStats') }}
          </v-btn>
        </v-col>
      </v-row>
      <v-btn variant="text" block to="/mood">{{ t('modules.mood') }}</v-btn>
    </template>
  </v-card>
</template>

<style scoped>
.day-guide-card {
  padding: clamp(1.1rem, 3.4vw, 1.55rem);
  border: none !important;
  background: var(--cx-surface) !important;
  box-shadow: var(--cx-shadow-lift) !important;
  overflow: visible !important;
  width: 100%;
  max-width: 100%;
  border-radius: var(--cx-radius-lg) !important;
}

.guide-head {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.guide-head__title {
  margin: 0;
  font-family: var(--cx-font-display);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--cx-text);
}

.guide-head__context {
  margin: 0.3rem 0 0;
  font-size: 0.875rem;
  line-height: 1.35;
  color: var(--cx-text-soft);
}

.habit-focus {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 0.95rem;
  border-radius: var(--cx-radius);
  background: var(--cx-surface-soft);
  border: none;
}

.habit-focus__icon {
  font-size: 1.75rem;
  line-height: 1;
}

.habit-focus__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--cx-text);
}

.guide-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.guide-skip {
  color: var(--cx-text-soft) !important;
}

@media (min-width: 600px) {
  .mood-tile {
    min-height: 5.1rem;
  }
}
</style>
