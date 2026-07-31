<script setup>
defineProps({
  /** 'mark' | 'full' */
  variant: { type: String, default: 'full' },
  size: { type: [Number, String], default: 40 },
  dark: { type: Boolean, default: false },
  stacked: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="brand-logo d-inline-flex align-center ga-3"
    :class="{ 'brand-logo--dark': dark, 'brand-logo--stacked': stacked }"
  >
    <svg
      class="brand-logo__mark"
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="18" fill="#7F9F7C" />
      <path
        d="M18 34c0-8.3 6.3-15 14.5-15S47 25.7 47 34"
        stroke="#F5F1EA"
        stroke-width="4.5"
        stroke-linecap="round"
      />
      <path
        d="M22 34c0-5.5 4.3-10 9.5-10S41 28.5 41 34"
        stroke="#EFC4A0"
        stroke-width="3.5"
        stroke-linecap="round"
      />
      <circle cx="32" cy="40" r="3.5" fill="#F5F1EA" />
    </svg>
    <div v-if="variant === 'full'" class="brand-logo__text">
      <div class="brand-logo__name">Correctly</div>
      <slot name="tagline">
        <div class="brand-logo__tagline">un día a la vez</div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.brand-logo__name {
  font-family: var(--cx-font-display);
  font-weight: 800;
  font-size: 1.35rem;
  line-height: 1.1;
  color: var(--cx-primary-deep);
  letter-spacing: -0.02em;
}
.brand-logo__tagline {
  font-size: 0.75rem;
  color: var(--cx-text-soft);
  margin-top: 2px;
}
.brand-logo--dark .brand-logo__name {
  color: var(--cx-bg);
}
.brand-logo--dark .brand-logo__tagline {
  color: color-mix(in srgb, var(--cx-bg) 70%, transparent);
}
.brand-logo--stacked {
  flex-direction: column;
  text-align: center;
  gap: 12px;
}
</style>

