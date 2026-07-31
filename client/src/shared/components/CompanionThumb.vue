<script setup>
/**
 * Miniatura 2D por categoría (grilla sin WebGL).
 */
import { computed } from 'vue'

const props = defineProps({
  appearance: { type: Object, required: true },
})

const species = computed(() => props.appearance.species || 'critter')
</script>

<template>
  <svg class="thumb" viewBox="0 0 64 72" aria-hidden="true">
    <ellipse cx="32" cy="66" rx="14" ry="3" fill="rgba(44,47,43,0.12)" />

    <!-- cuerpo según categoría -->
    <ellipse
      v-if="species === 'bear'"
      cx="32"
      cy="38"
      rx="20"
      ry="18"
      :fill="appearance.accent"
    />
    <ellipse
      v-else-if="species === 'sea' || species === 'frog'"
      cx="32"
      cy="40"
      rx="22"
      ry="14"
      :fill="appearance.accent"
    />
    <ellipse
      v-else-if="species === 'bird'"
      cx="32"
      cy="36"
      rx="14"
      ry="18"
      :fill="appearance.accent"
    />
    <ellipse
      v-else
      cx="32"
      cy="38"
      rx="17"
      ry="16"
      :fill="appearance.accent"
    />

    <!-- cabeza / hocico hint -->
    <ellipse
      v-if="species === 'bear' || species === 'dog' || species === 'farm'"
      cx="32"
      cy="28"
      rx="12"
      ry="11"
      :fill="appearance.accent"
    />
    <ellipse
      v-if="species === 'bear' || species === 'dog' || species === 'fox' || species === 'wild'"
      cx="32"
      cy="32"
      rx="6"
      ry="5"
      fill="#fff6ee"
      opacity="0.85"
    />

    <!-- orejas -->
    <g v-if="species === 'bunny'">
      <ellipse cx="24" cy="12" rx="4" ry="12" :fill="appearance.accent" />
      <ellipse cx="40" cy="12" rx="4" ry="12" :fill="appearance.accent" />
    </g>
    <g v-else-if="species === 'cat' || species === 'fox'">
      <path d="M20 24 L16 10 L28 22z" :fill="appearance.accent" />
      <path d="M44 24 L48 10 L36 22z" :fill="appearance.accent" />
    </g>
    <g v-else-if="species === 'bear' || species === 'dog'">
      <circle cx="20" cy="20" r="6" :fill="appearance.accent" />
      <circle cx="44" cy="20" r="6" :fill="appearance.accent" />
      <circle cx="20" cy="20" r="3" :fill="appearance.accent2" opacity="0.5" />
      <circle cx="44" cy="20" r="3" :fill="appearance.accent2" opacity="0.5" />
    </g>
    <g v-else-if="species === 'bird'">
      <path d="M32 18l-3-8h6z" :fill="appearance.accent2" />
    </g>

    <ellipse cx="32" cy="42" rx="8" ry="6" fill="#fff" opacity="0.3" />
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
    <rect x="24" y="50" width="4" height="10" rx="2" :fill="appearance.accent2" />
    <rect x="36" y="50" width="4" height="10" rx="2" :fill="appearance.accent2" />
  </svg>
</template>

<style scoped>
.thumb {
  width: 100%;
  height: auto;
  display: block;
}
</style>
