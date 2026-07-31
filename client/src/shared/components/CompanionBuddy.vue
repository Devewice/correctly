<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { COMPANION_NONE, resolveCompanionAppearance } from '@/shared/data/companions'
import {
  companionAppearance,
  companionMood,
  companionPetId,
  companionBubbleTick,
  celebrateCompanion,
  syncCompanionFromPrefs,
  syncCompanionFromDay,
  refreshCompanionVitality,
} from '@/shared/companions/companionBus'
import { companionSideForRoute } from '@/shared/companions/companionPlacement'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useDashboardStore } from '@/modules/dashboard/stores/useDashboardStore'
import CompanionViewport3D from '@/shared/components/CompanionViewport3D.vue'
import CompanionThumb from '@/shared/components/CompanionThumb.vue'

const props = defineProps({
  preview: { type: Boolean, default: false },
  /** Miniatura 2D (grilla). Si false en preview, usa 3D. */
  thumb: { type: Boolean, default: false },
  petId: { type: String, default: '' },
  mood: { type: String, default: '' },
  appearance: { type: Object, default: null },
  showBubble: { type: Boolean, default: false },
})

const { t, te } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const dash = useDashboardStore()
const { mdAndUp } = useDisplay()

const bubbleOn = ref(false)
let bubbleTimer = 0

const look = computed(() => {
  if (props.appearance) return props.appearance
  if (props.petId) return resolveCompanionAppearance({ companionPetId: props.petId })
  return companionAppearance.value
})

const activeMood = computed(() => props.mood || companionMood.value)
const visible = computed(
  () => Boolean(look.value) && (props.preview || companionPetId.value !== COMPANION_NONE),
)
const side = computed(() => (props.preview ? 'right' : companionSideForRoute(route.path)))
const displayName = computed(() => look.value?.name || '')
const use3d = computed(() => !props.thumb)

const stateLabel = computed(() => {
  const key = `companions.states.${activeMood.value}`
  return te(key) ? t(key) : ''
})

const bubbleText = computed(() => {
  const key = `companions.bubbles.${activeMood.value}`
  if (te(key)) return t(key, { name: displayName.value })
  return stateLabel.value
})

function flashBubble() {
  if (props.preview && !props.showBubble) return
  bubbleOn.value = true
  window.clearTimeout(bubbleTimer)
  bubbleTimer = window.setTimeout(() => {
    bubbleOn.value = false
  }, 4200)
}

function onTap() {
  if (props.preview) return
  celebrateCompanion('wave', 1600)
  flashBubble()
}

watch(
  () => [activeMood.value, companionBubbleTick.value],
  () => {
    if (!props.preview) flashBubble()
  },
)

watch(
  () => dash.today,
  (today) => {
    if (!props.preview && today) syncCompanionFromDay(today)
  },
  { deep: true },
)

watch(
  () => route.path,
  () => {
    if (!props.preview) refreshCompanionVitality()
  },
)

onMounted(() => {
  if (!props.preview) {
    syncCompanionFromPrefs(auth.user?.id)
    if (dash.today) syncCompanionFromDay(dash.today)
    else refreshCompanionVitality()
    flashBubble()
  }
})

onUnmounted(() => {
  window.clearTimeout(bubbleTimer)
})
</script>

<template>
  <div
    v-if="visible && look"
    class="buddy"
    :class="[
      `buddy--${activeMood}`,
      {
        'buddy--preview': preview,
        'buddy--thumb': thumb,
        'buddy--desktop': !preview && mdAndUp,
        'buddy--left': !preview && side === 'left',
        'buddy--right': !preview && side === 'right',
      },
    ]"
  >
    <div v-if="bubbleOn && bubbleText" class="buddy__bubble" role="status">
      {{ bubbleText }}
    </div>

    <button
      type="button"
      class="buddy__hit"
      :aria-label="preview ? displayName : t('companions.tapHint', { name: displayName })"
      :tabindex="preview ? -1 : 0"
      @click="onTap"
    >
      <div class="buddy__stage">
        <CompanionViewport3D
          v-if="use3d"
          :appearance="look"
          :mood="activeMood"
          :preview="preview"
        />
        <CompanionThumb v-else :appearance="look" />
      </div>
    </button>

    <span v-if="!preview" class="buddy__name">{{ displayName }}</span>
  </div>
</template>

<style scoped>
.buddy {
  z-index: 36;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  transition:
    left 0.45s ease,
    right 0.45s ease;
}

.buddy:not(.buddy--preview) {
  position: fixed;
  bottom: calc(4.55rem + env(safe-area-inset-bottom));
  width: 104px;
  filter: drop-shadow(0 8px 18px rgba(44, 47, 43, 0.16));
}

.buddy--right:not(.buddy--preview) {
  right: max(0.25rem, env(safe-area-inset-right));
  left: auto;
}

.buddy--left:not(.buddy--preview) {
  left: max(0.25rem, env(safe-area-inset-left));
  right: auto;
}

.buddy--desktop:not(.buddy--preview) {
  bottom: max(1rem, env(safe-area-inset-bottom));
  width: 120px;
}

.buddy--preview {
  position: relative;
  width: 88px;
  filter: none;
}

.buddy--thumb.buddy--preview {
  width: 56px;
}

.buddy__hit {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
}

.buddy--preview .buddy__hit {
  cursor: inherit;
  pointer-events: none;
}

.buddy__stage {
  width: 100%;
  aspect-ratio: 1 / 1.08;
}

.buddy__name {
  pointer-events: none;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1;
  color: var(--cx-text-soft);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.05rem;
}

.buddy__bubble {
  pointer-events: none;
  position: absolute;
  bottom: calc(100% - 0.2rem);
  max-width: 140px;
  padding: 0.42rem 0.58rem;
  border-radius: 14px;
  background: var(--cx-surface);
  color: var(--cx-text);
  border: 1px solid var(--cx-border);
  box-shadow: var(--cx-shadow-lift);
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  animation: bubble-in 0.28s ease;
  z-index: 2;
}

.buddy--left .buddy__bubble {
  left: 0;
}

.buddy--right .buddy__bubble,
.buddy--preview .buddy__bubble {
  right: 0;
}

.buddy__bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  width: 10px;
  height: 10px;
  background: var(--cx-surface);
  border-right: 1px solid var(--cx-border);
  border-bottom: 1px solid var(--cx-border);
  transform: rotate(45deg);
}

.buddy--left .buddy__bubble::after {
  left: 18px;
}

.buddy--right .buddy__bubble::after,
.buddy--preview .buddy__bubble::after {
  right: 18px;
}

@keyframes bubble-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .buddy__bubble {
    animation: none;
  }
}
</style>
