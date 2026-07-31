<script setup>
defineProps({
  /** 'mark' | 'full' */
  variant: { type: String, default: 'full' },
  size: { type: [Number, String], default: 40 },
  dark: { type: Boolean, default: false },
})
</script>

<template>
  <div class="brand-logo d-inline-flex align-center ga-3" :class="{ 'brand-logo--dark': dark }">
    <svg
      class="brand-logo__mark"
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="18" fill="#8BA888" />
      <path
        d="M18 34c0-8.3 6.3-15 14.5-15S47 25.7 47 34"
        stroke="#FAF8F5"
        stroke-width="4.5"
        stroke-linecap="round"
      />
      <path
        d="M22 34c0-5.5 4.3-10 9.5-10S41 28.5 41 34"
        stroke="#F4CBA8"
        stroke-width="3.5"
        stroke-linecap="round"
      />
      <circle cx="32" cy="40" r="3.5" fill="#FAF8F5" />
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
  font-family: 'Nunito', 'DM Sans', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.35rem;
  line-height: 1.1;
  color: #5e7a5b;
  letter-spacing: -0.02em;
}
.brand-logo__tagline {
  font-size: 0.75rem;
  color: rgba(61, 61, 61, 0.65);
  margin-top: 2px;
}
.brand-logo--dark .brand-logo__name {
  color: #faf8f5;
}
.brand-logo--dark .brand-logo__tagline {
  color: rgba(250, 248, 245, 0.7);
}
</style>
