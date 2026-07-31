<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  caredFor: { type: Array, default: () => [] },
  progress: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
})

const { t } = useI18n()

const phrase = computed(() => {
  if (props.progress >= 80) return t('day.closePhraseHigh')
  if (props.progress >= 40) return t('day.closePhraseMid')
  if (props.caredFor.length) return t('day.closePhraseSoft')
  return t('day.closePhraseEmpty')
})

const labels = computed(() =>
  props.caredFor.map((k) => t(`modules.${k}`, k)),
)
</script>

<template>
  <v-card class="day-close cx-card-shell pa-4 pa-sm-5" variant="flat">
    <p class="cx-section-label">{{ t('day.closeTitle') }}</p>
    <h2 class="day-close__phrase">{{ phrase }}</h2>
    <p v-if="labels.length" class="day-close__cared">
      {{ t('day.closeCared') }}
      <span v-for="(label, i) in labels" :key="label">
        {{ label }}<span v-if="i < labels.length - 1"> · </span>
      </span>
    </p>
    <p v-if="streak > 0" class="day-close__streak">
      {{ t('dashboard.streak', { days: streak }) }}
    </p>
    <div class="d-flex flex-wrap ga-2 mt-4">
      <v-btn color="primary" variant="tonal" to="/stats" size="small">
        {{ t('day.seeStats') }}
      </v-btn>
      <v-btn variant="text" to="/friends" size="small">
        {{ t('day.shareWithFriends') }}
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.day-close {
  background: linear-gradient(160deg, #eef3ed 0%, #faf8f5 55%, #f5ede3 100%) !important;
}
.day-close__phrase {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--cx-text);
}
.day-close__cared,
.day-close__streak {
  margin: 0.65rem 0 0;
  font-size: 0.875rem;
  color: var(--cx-text-soft);
  line-height: 1.4;
}
</style>
