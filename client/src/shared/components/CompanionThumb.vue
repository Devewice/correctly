<script setup>
/**
 * Miniatura 2D ligera para la grilla (evita 50 contextos WebGL).
 */
defineProps({
  appearance: { type: Object, required: true },
})
</script>

<template>
  <svg class="thumb" viewBox="0 0 64 72" aria-hidden="true">
    <ellipse cx="32" cy="64" rx="14" ry="3" fill="rgba(44,47,43,0.12)" />
    <ellipse
      cx="32"
      cy="36"
      :rx="appearance.body === 'bean' ? 20 : appearance.body === 'tall' ? 14 : 17"
      :ry="appearance.body === 'oval' || appearance.body === 'tall' ? 20 : 16"
      :fill="appearance.accent"
    />
    <ellipse cx="32" cy="40" rx="9" ry="7" fill="#fff" opacity="0.35" />
    <circle cx="26" cy="34" r="2.2" fill="#2c2f2b" />
    <circle cx="38" cy="34" r="2.2" fill="#2c2f2b" />
    <circle cx="26.7" cy="33.3" r="0.7" fill="#fff" />
    <circle cx="38.7" cy="33.3" r="0.7" fill="#fff" />
    <path
      d="M28 40 Q32 43 36 40"
      fill="none"
      stroke="#2c2f2b"
      stroke-width="1.4"
      stroke-linecap="round"
    />
    <rect x="24" y="48" width="4" height="10" rx="2" :fill="appearance.accent2" />
    <rect x="36" y="48" width="4" height="10" rx="2" :fill="appearance.accent2" />
  </svg>
</template>

<style scoped>
.thumb {
  width: 100%;
  height: auto;
  display: block;
}
</style>
