<script setup>
defineProps({
  show: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
</script>

<template>
  <Transition name="burst">
    <div v-if="show" class="burst" role="status">
      <div class="burst__mark">
        <div class="burst__ring" aria-hidden="true" />
        <span class="burst__check" aria-hidden="true">✓</span>
      </div>
      <p v-if="label" class="burst__label">{{ label }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.burst {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  pointer-events: none;
  background: rgba(250, 248, 245, 0.4);
  padding: 1rem;
}
.burst__mark {
  position: relative;
  width: min(88px, 22vw);
  height: min(88px, 22vw);
  display: grid;
  place-items: center;
}
.burst__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid var(--cx-primary, #8ba888);
  animation: ringPop 0.55s ease-out;
}
.burst__check {
  position: relative;
  z-index: 1;
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  line-height: 1;
  color: var(--cx-primary-deep, #5e7a5b);
  animation: checkPop 0.45s ease-out;
}
.burst__label {
  margin: 0;
  font-size: clamp(0.85rem, 3.5vw, 0.95rem);
  font-weight: 600;
  color: var(--cx-text, #3d3d3d);
  text-align: center;
}
.burst-enter-active,
.burst-leave-active {
  transition: opacity 0.35s ease;
}
.burst-enter-from,
.burst-leave-to {
  opacity: 0;
}
@keyframes ringPop {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  70% {
    transform: scale(1.06);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
@keyframes checkPop {
  0% {
    transform: scale(0.2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .burst__ring,
  .burst__check {
    animation: none;
  }
}
</style>
