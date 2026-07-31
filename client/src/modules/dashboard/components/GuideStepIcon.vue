<script setup>
defineProps({
  kind: { type: String, required: true },
  /** sm = cabecera compacta de la card de guía */
  size: { type: String, default: 'md' },
})
</script>

<template>
  <div
    class="guide-icon"
    :class="[`guide-icon--${kind}`, `guide-icon--${size}`]"
    aria-hidden="true"
  >
    <template v-if="kind === 'water'">
      <div class="guide-icon__glass">
        <div class="guide-icon__liquid" />
      </div>
    </template>
    <template v-else-if="kind === 'mood'">
      <span class="guide-icon__emoji">🙂</span>
    </template>
    <template v-else-if="kind === 'meal'">
      <span class="guide-icon__emoji">🥗</span>
    </template>
    <template v-else-if="kind === 'habit'">
      <span class="guide-icon__emoji">✨</span>
    </template>
    <template v-else-if="kind === 'sleep'">
      <span class="guide-icon__emoji">🌙</span>
    </template>
    <template v-else-if="kind === 'meditation'">
      <div class="guide-icon__breath" />
    </template>
    <template v-else-if="kind === 'activity'">
      <span class="guide-icon__emoji">🚶</span>
    </template>
    <template v-else-if="kind === 'journal'">
      <span class="guide-icon__emoji">📝</span>
    </template>
    <template v-else-if="kind === 'rest'">
      <span class="guide-icon__emoji">😴</span>
    </template>
    <template v-else>
      <span class="guide-icon__emoji">✓</span>
    </template>
  </div>
</template>

<style scoped>
.guide-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.guide-icon--sm {
  width: 44px;
  height: 44px;
  margin: 0;
  border-radius: 12px;
  background: var(--cx-surface-soft);
  border: 1px solid var(--cx-border);
}
.guide-icon--sm .guide-icon__emoji {
  font-size: 1.55rem;
}
.guide-icon--sm .guide-icon__glass {
  width: 22px;
  height: 28px;
  border-width: 2px;
}
.guide-icon--sm .guide-icon__breath {
  width: 28px;
  height: 28px;
}
.guide-icon__emoji {
  font-size: 2.4rem;
  line-height: 1;
  display: inline-block;
  animation: bounceSoft 2.4s ease-in-out infinite;
}
.guide-icon--meal .guide-icon__emoji {
  animation: floatY 3s ease-in-out infinite;
}
.guide-icon--sleep .guide-icon__emoji {
  animation: floatY 3.6s ease-in-out infinite;
}
.guide-icon--activity .guide-icon__emoji {
  animation: walk 1.2s ease-in-out infinite;
}
.guide-icon--habit .guide-icon__emoji {
  animation: pulsePop 2s ease-in-out infinite;
}
.guide-icon--done .guide-icon__emoji {
  animation: pulsePop 1.6s ease-in-out infinite;
}

.guide-icon__glass {
  width: 34px;
  height: 44px;
  border: 3px solid var(--cx-info);
  border-top: none;
  border-radius: 0 0 8px 8px;
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--cx-surface) 55%, transparent);
}
.guide-icon__liquid {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 55%;
  background: linear-gradient(180deg, #7ec8e3, var(--cx-info));
  animation: liquidWave 2.2s ease-in-out infinite;
  border-radius: 0 0 5px 5px;
}

.guide-icon__breath {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: radial-gradient(circle, #b5cfb5, var(--cx-primary));
  animation: breathe 4s ease-in-out infinite;
}

@keyframes liquidWave {
  0%,
  100% {
    height: 48%;
    transform: translateY(0);
  }
  50% {
    height: 62%;
    transform: translateY(-2px);
  }
}
@keyframes bounceSoft {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.05);
  }
}
@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@keyframes walk {
  0%,
  100% {
    transform: translateX(-3px);
  }
  50% {
    transform: translateX(3px);
  }
}
@keyframes pulsePop {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}
@keyframes breathe {
  0%,
  100% {
    transform: scale(0.85);
    opacity: 0.75;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .guide-icon__emoji,
  .guide-icon__liquid,
  .guide-icon__breath {
    animation: none !important;
  }
}
</style>
