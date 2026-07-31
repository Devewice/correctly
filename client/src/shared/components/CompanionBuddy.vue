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

const props = defineProps({
  preview: { type: Boolean, default: false },
  /** Forzar apariencia en selector (objeto o petId string vía petId) */
  petId: { type: String, default: '' },
  mood: { type: String, default: '' },
  /** Apariencia forzada (personalizador) */
  appearance: { type: Object, default: null },
  /** Mostrar bocadillo en preview */
  showBubble: { type: Boolean, default: false },
})

const { t, te } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const dash = useDashboardStore()
const { mdAndUp } = useDisplay()

const blink = ref(false)
const bubbleOn = ref(false)
let blinkTimer = 0
let bubbleTimer = 0
let wanderTimer = 0
const wander = ref(0)

const look = computed(() => {
  if (props.appearance) return props.appearance
  if (props.petId) {
    return resolveCompanionAppearance({ companionPetId: props.petId })
  }
  return companionAppearance.value
})

const activeMood = computed(() => props.mood || companionMood.value)
const visible = computed(
  () => Boolean(look.value) && (props.preview || companionPetId.value !== COMPANION_NONE),
)

const side = computed(() => (props.preview ? 'right' : companionSideForRoute(route.path)))

const displayName = computed(() => look.value?.name || '')

const stateLabel = computed(() => {
  const key = `companions.states.${activeMood.value}`
  return te(key) ? t(key) : ''
})

const bubbleText = computed(() => {
  const key = `companions.bubbles.${activeMood.value}`
  if (te(key)) return t(key, { name: displayName.value })
  return stateLabel.value
})

const mouthPath = computed(() => {
  const m = activeMood.value
  if (m === 'great' || m === 'happy' || m === 'proud' || m === 'strong') return 'M40 58 Q48 67 56 58'
  if (m === 'destroyed' || m === 'sick') return 'M40 62 Q48 56 56 62'
  if (m === 'low') return 'M40 60 L56 60'
  if (m === 'hungry') return 'M42 58 Q48 64 54 58'
  if (m === 'thirsty') return 'M44 58 Q48 65 52 58'
  if (m === 'sleepy' || m === 'ok') return 'M42 59 Q48 62 54 59'
  return 'M42 58 Q48 63 54 58'
})

const bodyRx = computed(() => {
  const b = look.value?.body
  if (b === 'oval') return 24
  if (b === 'bean') return 28
  if (b === 'tall') return 22
  return 26
})

const bodyRy = computed(() => {
  const b = look.value?.body
  if (b === 'oval') return 28
  if (b === 'bean') return 22
  if (b === 'tall') return 30
  return 24
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
  celebrateCompanion('wave', 1400)
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
    wanderTimer = window.setInterval(() => {
      wander.value = wander.value === 0 ? 6 : wander.value === 6 ? -4 : 0
    }, 3200)
  }
  const loop = () => {
    blink.value = true
    window.setTimeout(() => {
      blink.value = false
    }, 120)
    blinkTimer = window.setTimeout(loop, 2600 + Math.random() * 2800)
  }
  blinkTimer = window.setTimeout(loop, 1400)
})

onUnmounted(() => {
  window.clearTimeout(blinkTimer)
  window.clearTimeout(bubbleTimer)
  window.clearInterval(wanderTimer)
})
</script>

<template>
  <div
    v-if="visible && look"
    class="buddy"
    :class="[
      `buddy--${activeMood}`,
      `buddy--legs-${look.legs}`,
      {
        'buddy--preview': preview,
        'buddy--desktop': !preview && mdAndUp,
        'buddy--left': !preview && side === 'left',
        'buddy--right': !preview && side === 'right',
      },
    ]"
    :style="{
      '--buddy-a': look.accent,
      '--buddy-b': look.accent2,
      '--buddy-wander': preview ? '0px' : `${wander}px`,
    }"
  >
    <div
      v-if="bubbleOn && bubbleText"
      class="buddy__bubble"
      role="status"
    >
      {{ bubbleText }}
    </div>

    <button
      type="button"
      class="buddy__hit"
      :aria-label="preview ? displayName : t('companions.tapHint', { name: displayName })"
      :tabindex="preview ? -1 : 0"
      @click="onTap"
    >
      <svg class="buddy__svg" viewBox="0 0 96 104" aria-hidden="true">
        <ellipse class="buddy__shadow" cx="48" cy="96" rx="20" ry="4.5" />

        <!-- patas -->
        <g class="buddy__legs">
          <g class="buddy__leg buddy__leg--l">
            <rect x="34" y="72" width="7" height="16" rx="3.5" fill="var(--buddy-b)" />
            <ellipse cx="37.5" cy="88" rx="6" ry="3.2" fill="var(--buddy-b)" />
          </g>
          <g class="buddy__leg buddy__leg--r">
            <rect x="55" y="72" width="7" height="16" rx="3.5" fill="var(--buddy-b)" />
            <ellipse cx="58.5" cy="88" rx="6" ry="3.2" fill="var(--buddy-b)" />
          </g>
        </g>

        <!-- cola -->
        <g v-if="look.tail === 'cat'" class="buddy__tail">
          <path
            d="M70 50c14 4 16 18 8 26"
            fill="none"
            stroke="var(--buddy-b)"
            stroke-width="5"
            stroke-linecap="round"
          />
        </g>
        <g v-else-if="look.tail === 'dog'" class="buddy__tail">
          <path d="M68 48c10-10 18-4 14 8" fill="var(--buddy-b)" />
        </g>
        <g v-else-if="look.tail === 'fluff'" class="buddy__tail">
          <ellipse cx="74" cy="56" rx="10" ry="14" fill="var(--buddy-b)" opacity="0.85" />
        </g>
        <g v-else-if="look.tail === 'bird'" class="buddy__tail">
          <path d="M28 52l-14 4 14 4z" fill="var(--buddy-b)" opacity="0.7" />
          <path d="M68 52l14 4-14 4z" fill="var(--buddy-b)" opacity="0.7" />
        </g>
        <g v-else-if="look.tail === 'leaf'" class="buddy__tail">
          <ellipse cx="48" cy="18" rx="10" ry="6" fill="var(--buddy-b)" opacity="0.8" />
        </g>

        <!-- orejas -->
        <g v-if="look.ears === 'cat'" class="buddy__ears">
          <path d="M28 36 L22 16 L40 30z" fill="var(--buddy-a)" />
          <path d="M68 36 L74 16 L56 30z" fill="var(--buddy-a)" />
        </g>
        <g v-else-if="look.ears === 'dog'" class="buddy__ears">
          <ellipse cx="26" cy="42" rx="8" ry="14" fill="var(--buddy-b)" transform="rotate(-20 26 42)" />
          <ellipse cx="70" cy="42" rx="8" ry="14" fill="var(--buddy-b)" transform="rotate(20 70 42)" />
        </g>
        <g v-else-if="look.ears === 'bunny'" class="buddy__ears">
          <ellipse cx="34" cy="18" rx="6" ry="16" fill="var(--buddy-a)" />
          <ellipse cx="62" cy="18" rx="6" ry="16" fill="var(--buddy-a)" />
          <ellipse cx="34" cy="18" rx="2.5" ry="10" fill="var(--buddy-b)" opacity="0.45" />
          <ellipse cx="62" cy="18" rx="2.5" ry="10" fill="var(--buddy-b)" opacity="0.45" />
        </g>
        <g v-else-if="look.ears === 'fox'" class="buddy__ears">
          <path d="M26 38 L18 14 L40 30z" fill="var(--buddy-a)" />
          <path d="M70 38 L78 14 L56 30z" fill="var(--buddy-a)" />
          <path d="M26 36 L22 22 L36 32z" fill="#f2efe8" opacity="0.5" />
          <path d="M70 36 L74 22 L60 32z" fill="#f2efe8" opacity="0.5" />
        </g>
        <g v-else-if="look.ears === 'bear'" class="buddy__ears">
          <circle cx="28" cy="28" r="9" fill="var(--buddy-a)" />
          <circle cx="68" cy="28" r="9" fill="var(--buddy-a)" />
          <circle cx="28" cy="28" r="4" fill="var(--buddy-b)" opacity="0.4" />
          <circle cx="68" cy="28" r="4" fill="var(--buddy-b)" opacity="0.4" />
        </g>
        <g v-else-if="look.ears === 'chick'" class="buddy__ears">
          <path d="M48 22l-4-10 8 0z" fill="var(--buddy-b)" />
        </g>
        <g v-else-if="look.ears === 'horn'" class="buddy__ears">
          <path d="M48 28 L44 10 L52 10z" fill="var(--buddy-b)" />
        </g>

        <!-- cuerpo -->
        <ellipse
          class="buddy__body"
          cx="48"
          cy="50"
          :rx="bodyRx"
          :ry="bodyRy"
          fill="var(--buddy-a)"
        />
        <ellipse cx="48" cy="56" rx="14" ry="10" fill="#fff" opacity="0.32" />

        <!-- cara -->
        <g
          class="buddy__face"
          :class="{
            'buddy__face--blink': blink && !['sleepy', 'destroyed', 'sick'].includes(activeMood),
            'buddy__face--sleepy': activeMood === 'sleepy',
          }"
        >
          <template v-if="activeMood === 'destroyed'">
            <path d="M34 42l8 8M42 42l-8 8" stroke="#2c2f2b" stroke-width="2.2" stroke-linecap="round" />
            <path d="M54 42l8 8M62 42l-8 8" stroke="#2c2f2b" stroke-width="2.2" stroke-linecap="round" />
          </template>
          <template v-else-if="activeMood === 'sick'">
            <circle cx="38" cy="46" r="4.5" fill="none" stroke="#2c2f2b" stroke-width="1.8" />
            <circle cx="58" cy="46" r="4.5" fill="none" stroke="#2c2f2b" stroke-width="1.8" />
            <circle cx="38" cy="46" r="1.3" fill="#2c2f2b" />
            <circle cx="58" cy="46" r="1.3" fill="#2c2f2b" />
          </template>
          <template v-else>
            <ellipse class="buddy__eye" cx="38" cy="46" rx="3.8" ry="4.6" fill="#2c2f2b" />
            <ellipse class="buddy__eye" cx="58" cy="46" rx="3.8" ry="4.6" fill="#2c2f2b" />
            <circle cx="39.2" cy="44.6" r="1.1" fill="#fff" opacity="0.9" />
            <circle cx="59.2" cy="44.6" r="1.1" fill="#fff" opacity="0.9" />
          </template>
        </g>

        <path
          class="buddy__mouth"
          :d="mouthPath"
          fill="none"
          stroke="#2c2f2b"
          stroke-width="2"
          stroke-linecap="round"
        />

        <circle cx="30" cy="54" r="3.5" fill="#e8a090" opacity="0.4" />
        <circle cx="66" cy="54" r="3.5" fill="#e8a090" opacity="0.4" />

        <!-- props estado -->
        <g v-if="['happy', 'great', 'proud'].includes(activeMood)" class="buddy__fx">
          <circle cx="16" cy="34" r="2.2" fill="var(--buddy-b)" />
          <circle cx="80" cy="38" r="1.8" fill="var(--buddy-a)" />
        </g>
        <g v-if="activeMood === 'sleepy'" class="buddy__fx">
          <text x="74" y="26" font-size="9" font-weight="700" fill="var(--buddy-b)">z</text>
        </g>
        <g v-if="activeMood === 'thirsty'" class="buddy__fx">
          <path d="M78 28c0 5-3.5 8-3.5 8s-3.5-3-3.5-8a3.5 3.5 0 017 0z" fill="#6bb3d1" />
        </g>
        <g v-if="activeMood === 'hungry'" class="buddy__fx">
          <ellipse cx="78" cy="56" rx="4.5" ry="3.5" fill="var(--buddy-b)" />
        </g>
        <g v-if="activeMood === 'strong'" class="buddy__fx">
          <path d="M76 24l-5 9h4l-2 10 8-12h-4z" fill="var(--buddy-b)" />
        </g>
      </svg>
    </button>

    <span v-if="!preview" class="buddy__name">{{ displayName }}</span>
  </div>
</template>

<style scoped>
.buddy {
  --buddy-a: #7f9f7c;
  --buddy-b: #4a6648;
  --buddy-wander: 0px;
  z-index: 36;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  transition: left 0.45s ease, right 0.45s ease;
}

.buddy:not(.buddy--preview) {
  position: fixed;
  bottom: calc(4.55rem + env(safe-area-inset-bottom));
  width: 88px;
  transform: translateX(var(--buddy-wander));
  filter: drop-shadow(0 6px 12px rgba(44, 47, 43, 0.12));
}

.buddy--right:not(.buddy--preview) {
  right: max(0.4rem, env(safe-area-inset-right));
  left: auto;
}

.buddy--left:not(.buddy--preview) {
  left: max(0.4rem, env(safe-area-inset-left));
  right: auto;
}

.buddy--desktop:not(.buddy--preview) {
  bottom: max(1.1rem, env(safe-area-inset-bottom));
  width: 100px;
}

.buddy--preview {
  position: relative;
  width: 64px;
  filter: none;
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

.buddy__svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
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
  margin-top: 0.1rem;
}

/* Bocadillo */
.buddy__bubble {
  pointer-events: none;
  position: absolute;
  bottom: calc(100% - 0.15rem);
  max-width: 132px;
  padding: 0.4rem 0.55rem;
  border-radius: 12px;
  background: var(--cx-surface);
  color: var(--cx-text);
  border: 1px solid var(--cx-border);
  box-shadow: var(--cx-shadow);
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

.buddy__shadow {
  fill: rgba(44, 47, 43, 0.14);
}

/* Animaciones cuerpo */
.buddy--idle .buddy__body,
.buddy--ok .buddy__body {
  animation: body-bob 3s ease-in-out infinite;
  transform-origin: 48px 50px;
}

.buddy--happy .buddy__svg,
.buddy--great .buddy__svg {
  animation: hop 0.55s ease-in-out infinite;
}

.buddy--strong .buddy__svg,
.buddy--proud .buddy__svg {
  animation: swell 0.85s ease-in-out infinite;
}

.buddy--wave .buddy__svg {
  animation: tilt 0.4s ease-in-out 3;
}

.buddy--low .buddy__svg,
.buddy--destroyed .buddy__svg {
  animation: slump 3.6s ease-in-out infinite;
}

.buddy--sick .buddy__svg {
  animation: sick 2.2s ease-in-out infinite;
  filter: saturate(0.7) hue-rotate(35deg);
}

.buddy--sleepy .buddy__svg {
  animation: bob-slow 5s ease-in-out infinite;
}

.buddy--hungry .buddy__svg {
  animation: rumble 0.65s ease-in-out infinite;
}

.buddy--thirsty .buddy__svg {
  animation: bob-slow 2.4s ease-in-out infinite;
}

/* Piernas */
.buddy__leg {
  transform-origin: center top;
}

.buddy--legs-walk.buddy--idle .buddy__leg--l,
.buddy--legs-walk.buddy--ok .buddy__leg--l,
.buddy--legs-walk.buddy--happy .buddy__leg--l,
.buddy--legs-walk.buddy--great .buddy__leg--l,
.buddy--legs-walk.buddy--strong .buddy__leg--l {
  animation: leg-l 0.7s ease-in-out infinite;
}

.buddy--legs-walk.buddy--idle .buddy__leg--r,
.buddy--legs-walk.buddy--ok .buddy__leg--r,
.buddy--legs-walk.buddy--happy .buddy__leg--r,
.buddy--legs-walk.buddy--great .buddy__leg--r,
.buddy--legs-walk.buddy--strong .buddy__leg--r {
  animation: leg-r 0.7s ease-in-out infinite;
}

.buddy--legs-hop .buddy__leg--l,
.buddy--legs-hop .buddy__leg--r {
  animation: leg-hop 0.55s ease-in-out infinite;
}

.buddy--legs-stub .buddy__leg,
.buddy--legs-short .buddy__leg {
  animation: leg-shift 2.8s ease-in-out infinite;
}

.buddy__face--blink .buddy__eye {
  transform: scaleY(0.12);
  transform-origin: center;
}

.buddy__face--sleepy .buddy__eye {
  transform: scaleY(0.32);
  transform-origin: center;
}

.buddy__fx {
  animation: fx 1s ease-in-out infinite;
}

.buddy__tail {
  animation: tail 2.4s ease-in-out infinite;
  transform-origin: 60px 50px;
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

@keyframes body-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes bob-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes hop {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-9px);
  }
}

@keyframes swell {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes tilt {
  0%,
  100% {
    transform: rotate(0);
  }
  33% {
    transform: rotate(-10deg);
  }
  66% {
    transform: rotate(9deg);
  }
}

@keyframes slump {
  0%,
  100% {
    transform: translateY(2px) scale(0.96, 0.94);
  }
  50% {
    transform: translateY(4px) scale(0.95, 0.92);
  }
}

@keyframes sick {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

@keyframes rumble {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

@keyframes leg-l {
  0%,
  100% {
    transform: rotate(12deg);
  }
  50% {
    transform: rotate(-14deg);
  }
}

@keyframes leg-r {
  0%,
  100% {
    transform: rotate(-12deg);
  }
  50% {
    transform: rotate(14deg);
  }
}

@keyframes leg-hop {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes leg-shift {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(1px);
  }
}

@keyframes tail {
  0%,
  100% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(8deg);
  }
}

@keyframes fx {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .buddy__svg,
  .buddy__body,
  .buddy__leg,
  .buddy__tail,
  .buddy__fx,
  .buddy__bubble {
    animation: none !important;
  }
  .buddy:not(.buddy--preview) {
    transform: none;
  }
}

:global([data-theme='dark']) .buddy__shadow {
  fill: rgba(0, 0, 0, 0.35);
}
</style>
