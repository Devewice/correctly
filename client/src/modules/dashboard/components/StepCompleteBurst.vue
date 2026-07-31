<script setup>
defineProps({
  show: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
</script>

<template>
  <Transition name="burst">
    <div v-if="show" class="burst" role="status">
      <div class="burst__ring" />
      <div class="burst__check">✓</div>
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
  pointer-events: none;
  background: rgba(250, 248, 245, 0.35);
}
.burst__ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid #8ba888;
  animation: ringPop 0.55s ease-out;
}
.burst__check {
  position: absolute;
  font-size: 2rem;
  font-weight: 700;
  color: #5e7a5b;
  animation: checkPop 0.45s ease-out;
}
.burst__label {
  margin-top: 5.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3d3d3d;
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
    transform: scale(1.08);
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
