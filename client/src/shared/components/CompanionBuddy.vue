<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { getCompanion, COMPANION_NONE } from '@/shared/data/companions'
import {
  companionMood,
  companionPetId,
  celebrateCompanion,
  syncCompanionFromPrefs,
  syncCompanionFromDay,
  refreshCompanionVitality,
} from '@/shared/companions/companionBus'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useDashboardStore } from '@/modules/dashboard/stores/useDashboardStore'

const props = defineProps({
  preview: { type: Boolean, default: false },
  petId: { type: String, default: '' },
  mood: { type: String, default: '' },
})

const { t, te } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const dash = useDashboardStore()
const { mdAndUp } = useDisplay()
const blink = ref(false)
let blinkTimer = 0

const activeId = computed(() => props.petId || companionPetId.value)
const activeMood = computed(() => props.mood || companionMood.value)
const pet = computed(() => getCompanion(activeId.value))
const visible = computed(() => activeId.value !== COMPANION_NONE && Boolean(pet.value))

const label = computed(() => {
  if (!pet.value) return ''
  return t(`companions.pets.${pet.value.id}.name`)
})

const stateLabel = computed(() => {
  const key = `companions.states.${activeMood.value}`
  return te(key) ? t(key) : ''
})

const aria = computed(() => {
  if (props.preview) return label.value
  if (stateLabel.value) {
    return t('companions.stateHint', { name: label.value, state: stateLabel.value })
  }
  return t('companions.tapHint', { name: label.value })
})

const mouthPath = computed(() => {
  const m = activeMood.value
  if (m === 'great' || m === 'happy' || m === 'proud' || m === 'strong') return 'M40 60 Q48 69 56 60'
  if (m === 'destroyed' || m === 'sick') return 'M40 64 Q48 58 56 64'
  if (m === 'low') return 'M40 62 L56 62'
  if (m === 'hungry') return 'M42 60 Q48 66 54 60'
  if (m === 'thirsty') return 'M44 60 Q48 67 52 60'
  if (m === 'sleepy' || m === 'ok') return 'M42 61 Q48 64 54 61'
  return 'M42 60 Q48 65 54 60'
})

function onTap() {
  if (props.preview) return
  celebrateCompanion('wave', 1400)
}

function pullVitality() {
  if (props.preview) return
  if (dash.today) syncCompanionFromDay(dash.today)
  else refreshCompanionVitality()
}

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
    pullVitality()
  }
  const loop = () => {
    blink.value = true
    window.setTimeout(() => {
      blink.value = false
    }, 140)
    blinkTimer = window.setTimeout(loop, 2800 + Math.random() * 3200)
  }
  blinkTimer = window.setTimeout(loop, 1600)
})

onUnmounted(() => {
  window.clearTimeout(blinkTimer)
})
</script>

<template>
  <button
    v-if="visible"
    type="button"
    class="buddy"
    :class="[
      `buddy--${activeId}`,
      `buddy--${activeMood}`,
      { 'buddy--preview': preview, 'buddy--desktop': !preview && mdAndUp },
    ]"
    :style="{
      '--buddy-a': pet.accent,
      '--buddy-b': pet.accent2,
    }"
    :aria-label="aria"
    :tabindex="preview ? -1 : 0"
    @click="onTap"
  >
    <svg class="buddy__svg" viewBox="0 0 96 96" aria-hidden="true">
      <ellipse class="buddy__shadow" cx="48" cy="86" rx="22" ry="5" />

      <g v-if="activeId === 'moka'" class="buddy__tail">
        <path
          d="M70 52c12 2 16 14 10 22"
          fill="none"
          stroke="var(--buddy-b)"
          stroke-width="6"
          stroke-linecap="round"
        />
      </g>
      <g v-else-if="activeId === 'pipa'" class="buddy__wing">
        <ellipse cx="28" cy="52" rx="10" ry="14" fill="var(--buddy-b)" opacity="0.55" />
        <ellipse cx="68" cy="52" rx="10" ry="14" fill="var(--buddy-b)" opacity="0.55" />
      </g>
      <g v-else-if="activeId === 'nori'" class="buddy__leaf">
        <path
          d="M48 18c8-10 22-8 22 4-10 2-16 8-22 16-6-8-12-14-22-16 0-12 14-14 22-4z"
          fill="var(--buddy-b)"
          opacity="0.85"
        />
      </g>
      <g v-else-if="activeId === 'luma'" class="buddy__star">
        <path
          d="M78 28l3 7 7 2-6 5 2 8-6-4-7 4 2-8-6-5 8-2z"
          fill="var(--buddy-a)"
          opacity="0.9"
        />
      </g>
      <g v-else-if="activeId === 'kiwi'" class="buddy__sprout">
        <path d="M48 22v10" stroke="var(--buddy-b)" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="40" cy="20" rx="8" ry="5" fill="var(--buddy-a)" transform="rotate(-25 40 20)" />
        <ellipse cx="56" cy="20" rx="8" ry="5" fill="var(--buddy-a)" transform="rotate(25 56 20)" />
      </g>

      <g v-if="activeId === 'moka' || activeId === 'luma'" class="buddy__ears">
        <ellipse cx="30" cy="30" rx="9" ry="14" fill="var(--buddy-a)" transform="rotate(-18 30 30)" />
        <ellipse cx="66" cy="30" rx="9" ry="14" fill="var(--buddy-a)" transform="rotate(18 66 30)" />
        <ellipse
          cx="30"
          cy="32"
          rx="4"
          ry="7"
          fill="var(--buddy-b)"
          opacity="0.45"
          transform="rotate(-18 30 32)"
        />
        <ellipse
          cx="66"
          cy="32"
          rx="4"
          ry="7"
          fill="var(--buddy-b)"
          opacity="0.45"
          transform="rotate(18 66 32)"
        />
      </g>
      <g v-else-if="activeId === 'nori'" class="buddy__ears">
        <path d="M26 38 L20 18 L38 30z" fill="var(--buddy-a)" />
        <path d="M70 38 L76 18 L58 30z" fill="var(--buddy-a)" />
      </g>

      <ellipse
        class="buddy__body"
        :cx="48"
        :cy="activeId === 'pipa' ? 50 : 52"
        :rx="activeId === 'pipa' ? 26 : 28"
        :ry="activeId === 'pipa' ? 30 : 26"
        fill="var(--buddy-a)"
      />

      <ellipse
        cx="48"
        :cy="activeId === 'pipa' ? 56 : 58"
        rx="16"
        ry="12"
        fill="#fff"
        opacity="0.35"
      />

      <path v-if="activeId === 'pipa'" d="M48 54l8 4-8 4z" fill="var(--buddy-b)" />

      <!-- ojos -->
      <g
        class="buddy__face"
        :class="{
          'buddy__face--blink': blink && !['sleepy', 'destroyed', 'sick'].includes(activeMood),
          'buddy__face--sleepy': activeMood === 'sleepy',
          'buddy__face--down': activeMood === 'low' || activeMood === 'destroyed',
        }"
      >
        <template v-if="activeMood === 'destroyed'">
          <path d="M34 44l8 8M42 44l-8 8" stroke="#2c2f2b" stroke-width="2.4" stroke-linecap="round" />
          <path d="M54 44l8 8M62 44l-8 8" stroke="#2c2f2b" stroke-width="2.4" stroke-linecap="round" />
        </template>
        <template v-else-if="activeMood === 'sick'">
          <circle cx="38" cy="48" r="5" fill="none" stroke="#2c2f2b" stroke-width="2" />
          <circle cx="58" cy="48" r="5" fill="none" stroke="#2c2f2b" stroke-width="2" />
          <circle cx="38" cy="48" r="1.5" fill="#2c2f2b" />
          <circle cx="58" cy="48" r="1.5" fill="#2c2f2b" />
        </template>
        <template v-else-if="activeMood === 'strong'">
          <ellipse class="buddy__eye" cx="38" cy="48" rx="4.2" ry="4.5" fill="#2c2f2b" />
          <ellipse class="buddy__eye" cx="58" cy="48" rx="4.2" ry="4.5" fill="#2c2f2b" />
          <path d="M32 40h10" stroke="#2c2f2b" stroke-width="2" stroke-linecap="round" />
          <path d="M54 40h10" stroke="#2c2f2b" stroke-width="2" stroke-linecap="round" />
          <circle cx="39.5" cy="46.5" r="1.2" fill="#fff" opacity="0.85" />
          <circle cx="59.5" cy="46.5" r="1.2" fill="#fff" opacity="0.85" />
        </template>
        <template v-else>
          <ellipse class="buddy__eye" cx="38" cy="48" rx="4.2" ry="5" fill="#2c2f2b" />
          <ellipse class="buddy__eye" cx="58" cy="48" rx="4.2" ry="5" fill="#2c2f2b" />
          <circle cx="39.5" cy="46.5" r="1.3" fill="#fff" opacity="0.85" />
          <circle cx="59.5" cy="46.5" r="1.3" fill="#fff" opacity="0.85" />
        </template>
      </g>

      <!-- boca -->
      <path
        class="buddy__mouth"
        :d="mouthPath"
        fill="none"
        stroke="#2c2f2b"
        stroke-width="2.2"
        stroke-linecap="round"
      />

      <circle
        cx="30"
        cy="56"
        r="4"
        fill="#e8a090"
        :opacity="['sick', 'destroyed', 'low'].includes(activeMood) ? 0.15 : 0.45"
      />
      <circle
        cx="66"
        cy="56"
        r="4"
        fill="#e8a090"
        :opacity="['sick', 'destroyed', 'low'].includes(activeMood) ? 0.15 : 0.45"
      />

      <!-- props de estado -->
      <g v-if="activeMood === 'happy' || activeMood === 'great' || activeMood === 'proud'" class="buddy__spark">
        <circle cx="18" cy="34" r="2.5" fill="var(--buddy-b)" />
        <circle cx="78" cy="40" r="2" fill="var(--buddy-a)" />
        <circle cx="22" cy="68" r="1.8" fill="var(--buddy-b)" />
      </g>
      <g v-if="activeMood === 'great'" class="buddy__spark">
        <path d="M14 52l3 2-3 2-2-2z" fill="var(--buddy-b)" />
        <path d="M82 56l3 2-3 2-2-2z" fill="var(--buddy-a)" />
      </g>
      <g v-if="activeMood === 'sleepy'" class="buddy__zzz">
        <text x="72" y="28" font-size="10" font-weight="700" fill="var(--buddy-b)" opacity="0.85">z</text>
        <text x="78" y="20" font-size="8" font-weight="700" fill="var(--buddy-b)" opacity="0.65">z</text>
      </g>
      <g v-if="activeMood === 'hungry'" class="buddy__crumb">
        <ellipse cx="78" cy="58" rx="5" ry="4" fill="var(--buddy-b)" opacity="0.75" />
        <ellipse cx="78" cy="58" rx="2.5" ry="2" fill="#fff" opacity="0.35" />
      </g>
      <g v-if="activeMood === 'thirsty'" class="buddy__drop">
        <path d="M78 30c0 6-4 10-4 10s-4-4-4-10a4 4 0 018 0z" fill="#6bb3d1" opacity="0.9" />
      </g>
      <g v-if="activeMood === 'sick'" class="buddy__thermo">
        <rect x="74" y="24" width="4" height="16" rx="2" fill="#e07a72" opacity="0.9" />
        <circle cx="76" cy="42" r="4" fill="#e07a72" />
      </g>
      <g v-if="activeMood === 'strong'" class="buddy__bolt">
        <path d="M76 26l-6 10h5l-3 12 10-14h-5z" fill="var(--buddy-b)" opacity="0.9" />
      </g>
    </svg>
    <span v-if="!preview" class="buddy__name">{{ label }}</span>
    <span v-if="!preview && stateLabel" class="buddy__state">{{ stateLabel }}</span>
  </button>
</template>

<style scoped>
.buddy {
  --buddy-a: #7f9f7c;
  --buddy-b: #4a6648;
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
  z-index: 40;
  color: var(--cx-text-soft);
  -webkit-tap-highlight-color: transparent;
}

.buddy:not(.buddy--preview) {
  position: fixed;
  right: max(0.65rem, env(safe-area-inset-right));
  bottom: calc(4.6rem + env(safe-area-inset-bottom));
  width: 80px;
  filter: drop-shadow(0 6px 14px rgba(44, 47, 43, 0.14));
}

.buddy--desktop:not(.buddy--preview) {
  bottom: max(1.25rem, env(safe-area-inset-bottom));
  right: max(1.25rem, env(safe-area-inset-right));
  width: 92px;
}

.buddy--preview {
  position: relative;
  width: 72px;
  filter: none;
  cursor: inherit;
}

.buddy__svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.buddy__name {
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1;
  opacity: 0.8;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.buddy__state {
  font-size: 0.58rem;
  font-weight: 600;
  line-height: 1.1;
  opacity: 0.72;
  max-width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.buddy__shadow {
  fill: rgba(44, 47, 43, 0.12);
}

.buddy--idle .buddy__svg,
.buddy--ok .buddy__svg {
  animation: buddy-bob 3.2s ease-in-out infinite;
}

.buddy--sleepy .buddy__svg {
  animation: buddy-bob 5.5s ease-in-out infinite;
}

.buddy--happy .buddy__svg,
.buddy--great .buddy__svg {
  animation: buddy-hop 0.55s ease-in-out infinite;
}

.buddy--strong .buddy__svg,
.buddy--proud .buddy__svg {
  animation: buddy-swell 0.9s ease-in-out infinite;
}

.buddy--wave .buddy__svg {
  animation: buddy-tilt 0.45s ease-in-out 3;
}

.buddy--low .buddy__svg,
.buddy--destroyed .buddy__svg {
  animation: buddy-slump 3.8s ease-in-out infinite;
}

.buddy--hungry .buddy__svg {
  animation: buddy-rumble 0.7s ease-in-out infinite;
}

.buddy--thirsty .buddy__svg {
  animation: buddy-bob 2.4s ease-in-out infinite;
}

.buddy--sick .buddy__svg {
  animation: buddy-sick 2.2s ease-in-out infinite;
  filter: saturate(0.75) hue-rotate(40deg);
}

.buddy__face--blink .buddy__eye {
  transform: scaleY(0.12);
  transform-origin: center;
}

.buddy__face--sleepy .buddy__eye {
  transform: scaleY(0.35);
  transform-origin: center;
}

.buddy__face--down {
  transform: translateY(2px);
}

.buddy__spark,
.buddy__zzz,
.buddy__drop {
  animation: buddy-spark 0.9s ease-in-out infinite;
}

.buddy__crumb {
  animation: buddy-rumble 0.7s ease-in-out infinite;
}

@keyframes buddy-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes buddy-hop {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-10px) scale(1.04);
  }
}

@keyframes buddy-swell {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes buddy-tilt {
  0%,
  100% {
    transform: rotate(0deg);
  }
  33% {
    transform: rotate(-12deg);
  }
  66% {
    transform: rotate(10deg);
  }
}

@keyframes buddy-slump {
  0%,
  100% {
    transform: translateY(3px) scale(0.96, 0.94);
  }
  50% {
    transform: translateY(5px) scale(0.95, 0.92);
  }
}

@keyframes buddy-rumble {
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

@keyframes buddy-sick {
  0%,
  100% {
    transform: rotate(-2deg) translateY(2px);
  }
  50% {
    transform: rotate(2deg) translateY(3px);
  }
}

@keyframes buddy-spark {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .buddy__svg,
  .buddy__spark,
  .buddy__zzz,
  .buddy__drop,
  .buddy__crumb {
    animation: none !important;
  }
}

:global([data-theme='dark']) .buddy__shadow {
  fill: rgba(0, 0, 0, 0.35);
}

:global([data-theme='dark']) .buddy:not(.buddy--preview) {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35));
}
</style>
