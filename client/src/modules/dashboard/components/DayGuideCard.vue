<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fadeUp, moodHover, softHover, popIn, withDelay } from '@/shared/motion/presets'
import { WATER_OPTIONS, glassesFromMl } from '@/shared/utils/water'
import GuideStepIcon from '@/modules/dashboard/components/GuideStepIcon.vue'

const props = defineProps({
  step: { type: Object, required: true },
  mealType: { type: String, default: 'breakfast' },
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
</script>

<template>
  <v-card
    v-motion
    :initial="{ opacity: 0, y: 28, scale: 0.96 }"
    :enter="{
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 140, damping: 16 },
    }"
    class="pa-4 pa-sm-6 day-guide-card"
  >
    <GuideStepIcon :kind="step.key === 'done' ? 'done' : step.key" />

    <template v-if="step.key === 'mood'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.moodAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.moodHint') }}</p>
      <v-row dense class="mb-6">
        <v-col v-for="(m, i) in moods" :key="m.value" cols="4" sm>
          <div v-motion v-bind="{ ...moodHover, ...withDelay(fadeUp, 160 + i * 50) }">
            <button
              type="button"
              class="mood-tile"
              :class="{ 'mood-tile--selected': selectedMood === m.value }"
              :disabled="busy"
              @click="selectedMood = m.value"
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
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.waterAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-2">{{ t('day.waterHint') }}</p>
      <p class="text-h6 font-weight-bold text-info mb-6">
        {{
          (step.water || 0) > 0
            ? t('day.waterNow', { glasses: glassesFromMl(step.water) })
            : t('day.waterNowEmpty')
        }}
      </p>
      <v-row dense class="mb-4">
        <v-col v-for="(opt, i) in WATER_OPTIONS.slice(0, 2)" :key="opt.ml" cols="6">
          <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 200 + i * 70) }">
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
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <template v-else-if="step.key === 'meal'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.mealAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ t('day.mealHint', { type: t(`meals.types.${step.mealType || mealType}`) }) }}
      </p>
      <v-text-field
        v-model="mealText"
        :label="t('meals.description')"
        autofocus
        class="mb-4"
        @keyup.enter="saveMeal"
      />
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-2"
        :disabled="!mealText.trim()"
        :loading="busy"
        @click="saveMeal"
      >
        {{ t('day.continue') }}
      </v-btn>
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <template v-else-if="step.key === 'habit'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.habitAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.habitHint') }}</p>
      <v-card
        v-motion
        v-bind="{ ...softHover, ...withDelay(popIn, 160) }"
        color="surface-light"
        variant="flat"
        class="pa-5 mb-6 text-center"
      >
        <div class="text-h3 mb-2">{{ step.habit.icon }}</div>
        <div class="text-h6 font-weight-bold">{{ step.habit.name }}</div>
      </v-card>
      <v-btn
        block
        color="success"
        size="large"
        class="mb-2"
        :loading="busy"
        @click="emit('habit', step.habit)"
      >
        {{ t('day.habitDone') }}
      </v-btn>
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <template v-else-if="step.key === 'sleep'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.sleepAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.sleepHint') }}</p>
      <v-row dense class="mb-4">
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
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <template v-else-if="step.key === 'meditation'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.meditationAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.meditationHint') }}</p>
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-2"
        :loading="busy"
        @click="emit('meditation', 3)"
      >
        {{ t('day.meditationQuick') }}
      </v-btn>
      <v-btn variant="text" block to="/meditation">{{ t('day.meditationOpen') }}</v-btn>
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <template v-else-if="step.key === 'activity'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.activityAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.activityHint') }}</p>
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-2"
        :loading="busy"
        @click="emit('activity', { type: 'walk', duration: 15, intensity: 'light' })"
      >
        {{ t('day.activityQuick') }}
      </v-btn>
      <v-btn variant="text" block to="/activity">{{ t('day.activityOpen') }}</v-btn>
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <template v-else-if="step.key === 'journal'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.journalAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">{{ t('day.journalHint') }}</p>
      <v-textarea
        v-model="journalText"
        rows="3"
        auto-grow
        :label="t('journal.line')"
        class="mb-4"
      />
      <v-btn
        block
        color="primary"
        size="large"
        class="mb-2"
        :disabled="!journalText.trim()"
        :loading="busy"
        @click="saveJournal"
      >
        {{ t('day.continue') }}
      </v-btn>
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <template v-else-if="step.key === 'rest'">
      <h2 class="text-h5 font-weight-bold mb-2 text-center">{{ t('day.restTitle') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6 text-center">{{ t('day.restHint') }}</p>
      <v-btn color="primary" variant="tonal" block to="/sleep">{{ t('day.seeSleep') }}</v-btn>
    </template>

    <template v-else>
      <div class="text-center py-2">
        <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.doneTitle') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.doneHint') }}</p>
        <v-btn color="primary" variant="tonal" to="/stats" prepend-icon="mdi-chart-bar">
          {{ t('day.seeStats') }}
        </v-btn>
      </div>
    </template>
  </v-card>
</template>

<style scoped>
.mood-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  min-height: 5.5rem;
  padding: 0.75rem 0.4rem;
  border: 2px solid #e4d9cb;
  border-radius: 1rem;
  background: #f5ede3;
  color: #3d3d3d;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.mood-tile:hover:not(:disabled) {
  border-color: #8ba888;
  background: #eef3ed;
}

.mood-tile--selected {
  border-color: #8ba888;
  background: #f4cba8;
  box-shadow: 0 0 0 1px #8ba888;
}

.mood-tile:disabled {
  opacity: 0.6;
  cursor: default;
}

.mood-tile__emoji {
  font-size: 2rem;
  line-height: 1.1;
}

.mood-tile__label {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  color: #3d3d3d;
  text-align: center;
}

@media (min-width: 600px) {
  .mood-tile {
    min-height: 6.25rem;
  }

  .mood-tile__emoji {
    font-size: 2.35rem;
  }
}
</style>
