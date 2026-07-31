<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fadeUp, moodHover, softHover, popIn, withDelay } from '@/shared/motion/presets'
import { WATER_OPTIONS, glassesFromMl } from '@/shared/utils/water'

const props = defineProps({
  step: { type: Object, required: true },
  mealType: { type: String, default: 'breakfast' },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['mood', 'water', 'meal', 'habit', 'skip'])
const { t } = useI18n()

const moods = [
  { value: 1, emoji: '😢' },
  { value: 2, emoji: '😕' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😄' },
]

const mealText = ref('')
const selectedMood = ref(null)

watch(
  () => props.step.id,
  () => {
    selectedMood.value = null
    mealText.value = ''
  },
)

function saveMood() {
  if (!selectedMood.value) return
  emit('mood', selectedMood.value)
}

function saveMeal() {
  if (!mealText.value.trim()) return
  emit('meal', { type: props.mealType, description: mealText.value.trim() })
  mealText.value = ''
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
    class="pa-6 day-guide-card"
  >
    <template v-if="step.key === 'mood'">
      <div
        v-motion
        v-bind="withDelay(fadeUp, 40)"
        class="text-caption text-primary text-uppercase font-weight-bold mb-2"
      >
        {{ t('day.stepLabel', { n: 1 }) }}
      </div>
      <h2 v-motion v-bind="withDelay(fadeUp, 80)" class="text-h5 font-weight-bold mb-2">
        {{ t('day.moodAsk') }}
      </h2>
      <p v-motion v-bind="withDelay(fadeUp, 120)" class="text-body-2 text-medium-emphasis mb-6">
        {{ t('day.moodHint') }}
      </p>
      <div class="d-flex justify-space-between ga-2 mb-6">
        <div
          v-for="(m, i) in moods"
          :key="m.value"
          v-motion
          v-bind="{
            ...moodHover,
            ...withDelay(fadeUp, 160 + i * 50),
          }"
          class="flex-grow-1"
        >
          <v-btn
            block
            size="large"
            :variant="selectedMood === m.value ? 'flat' : 'tonal'"
            :color="selectedMood === m.value ? 'secondary' : undefined"
            class="text-h5"
            @click="selectedMood = m.value"
          >
            {{ m.emoji }}
          </v-btn>
        </div>
      </div>
      <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 420) }">
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
      </div>
    </template>

    <template v-else-if="step.key === 'water'">
      <div v-motion v-bind="withDelay(fadeUp, 40)" class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 v-motion v-bind="withDelay(fadeUp, 80)" class="text-h5 font-weight-bold mb-2">
        {{ t('day.waterAsk') }}
      </h2>
      <p v-motion v-bind="withDelay(fadeUp, 120)" class="text-body-2 text-medium-emphasis mb-2">
        {{ t('day.waterHint') }}
      </p>
      <p v-motion v-bind="withDelay(fadeUp, 160)" class="text-h6 font-weight-bold text-info mb-6">
        {{
          (step.water || 0) > 0
            ? t('day.waterNow', { glasses: glassesFromMl(step.water) })
            : t('day.waterNowEmpty')
        }}
      </p>
      <v-row dense class="mb-4">
        <v-col
          v-for="(opt, i) in WATER_OPTIONS.slice(0, 2)"
          :key="opt.ml"
          cols="6"
        >
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
      <v-btn v-motion v-bind="withDelay(fadeUp, 360)" variant="text" block @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'meal'">
      <div v-motion v-bind="withDelay(fadeUp, 40)" class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 v-motion v-bind="withDelay(fadeUp, 80)" class="text-h5 font-weight-bold mb-2">
        {{ t('day.mealAsk') }}
      </h2>
      <p v-motion v-bind="withDelay(fadeUp, 120)" class="text-body-2 text-medium-emphasis mb-4">
        {{ t('day.mealHint', { type: t(`meals.types.${mealType}`) }) }}
      </p>
      <div v-motion v-bind="withDelay(fadeUp, 180)">
        <v-text-field
          v-model="mealText"
          :label="t('meals.description')"
          autofocus
          class="mb-4"
          @keyup.enter="saveMeal"
        />
      </div>
      <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 240) }" class="mb-2">
        <v-btn
          block
          color="primary"
          size="large"
          :disabled="!mealText.trim()"
          :loading="busy"
          @click="saveMeal"
        >
          {{ t('day.continue') }}
        </v-btn>
      </div>
      <v-btn v-motion v-bind="withDelay(fadeUp, 300)" variant="text" block @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else-if="step.key === 'habit'">
      <div v-motion v-bind="withDelay(fadeUp, 40)" class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 v-motion v-bind="withDelay(fadeUp, 80)" class="text-h5 font-weight-bold mb-2">
        {{ t('day.habitAsk') }}
      </h2>
      <p v-motion v-bind="withDelay(fadeUp, 120)" class="text-body-2 text-medium-emphasis mb-6">
        {{ t('day.habitHint') }}
      </p>
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
      <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 240) }" class="mb-2">
        <v-btn
          block
          color="success"
          size="large"
          :loading="busy"
          @click="emit('habit', step.habit)"
        >
          {{ t('day.habitDone') }}
        </v-btn>
      </div>
      <v-btn v-motion v-bind="withDelay(fadeUp, 300)" variant="text" block @click="emit('skip')">
        {{ t('day.skip') }}
      </v-btn>
    </template>

    <template v-else>
      <div class="text-center py-2">
        <div v-motion v-bind="popIn" class="d-inline-block mb-4">
          <v-avatar color="primary" variant="tonal" size="72">
            <v-icon icon="mdi-check-decagram" size="40" />
          </v-avatar>
        </div>
        <h2 v-motion v-bind="withDelay(fadeUp, 100)" class="text-h5 font-weight-bold mb-2">
          {{ t('day.doneTitle') }}
        </h2>
        <p v-motion v-bind="withDelay(fadeUp, 160)" class="text-body-2 text-medium-emphasis mb-6">
          {{ t('day.doneHint') }}
        </p>
        <div v-motion v-bind="{ ...softHover, ...withDelay(fadeUp, 220) }">
          <v-btn color="primary" variant="tonal" to="/stats" prepend-icon="mdi-chart-bar">
            {{ t('day.seeStats') }}
          </v-btn>
        </div>
      </div>
    </template>
  </v-card>
</template>
