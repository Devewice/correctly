<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
    :initial="{ opacity: 0, y: 16 }"
    :enter="{ opacity: 1, y: 0 }"
    class="pa-6 day-guide-card"
  >
    <!-- Mood -->
    <template v-if="step.key === 'mood'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepLabel', { n: 1 }) }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.moodAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.moodHint') }}</p>
      <div class="d-flex justify-space-between ga-2 mb-6">
        <v-btn
          v-for="m in moods"
          :key="m.value"
          size="large"
          :variant="selectedMood === m.value ? 'flat' : 'tonal'"
          :color="selectedMood === m.value ? 'secondary' : undefined"
          class="text-h5 flex-grow-1"
          @click="selectedMood = m.value"
        >
          {{ m.emoji }}
        </v-btn>
      </div>
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

    <!-- Water -->
    <template v-else-if="step.key === 'water'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.waterAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-2">{{ t('day.waterHint') }}</p>
      <p class="text-h6 font-weight-bold text-info mb-6">
        {{ t('day.waterNow', { ml: step.water || 0 }) }}
      </p>
      <v-row dense class="mb-4">
        <v-col v-for="amount in [250, 500]" :key="amount" cols="6">
          <v-btn
            block
            color="info"
            variant="tonal"
            size="large"
            :loading="busy"
            @click="emit('water', amount)"
          >
            +{{ amount }} ml
          </v-btn>
        </v-col>
      </v-row>
      <v-btn variant="text" block @click="emit('skip')">{{ t('day.skip') }}</v-btn>
    </template>

    <!-- Meal -->
    <template v-else-if="step.key === 'meal'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.mealAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ t('day.mealHint', { type: t(`meals.types.${mealType}`) }) }}
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

    <!-- Habit -->
    <template v-else-if="step.key === 'habit'">
      <div class="text-caption text-primary text-uppercase font-weight-bold mb-2">
        {{ t('day.stepOf') }}
      </div>
      <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.habitAsk') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.habitHint') }}</p>
      <v-card color="surface-light" variant="flat" class="pa-5 mb-6 text-center">
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

    <!-- Done -->
    <template v-else>
      <div class="text-center py-2">
        <v-avatar color="primary" variant="tonal" size="72" class="mb-4">
          <v-icon icon="mdi-check-decagram" size="40" />
        </v-avatar>
        <h2 class="text-h5 font-weight-bold mb-2">{{ t('day.doneTitle') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">{{ t('day.doneHint') }}</p>
        <v-btn color="primary" variant="tonal" to="/stats" prepend-icon="mdi-chart-bar">
          {{ t('day.seeStats') }}
        </v-btn>
      </div>
    </template>
  </v-card>
</template>
