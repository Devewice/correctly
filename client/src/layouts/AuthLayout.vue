<script setup>
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { withDelay, fadeIn, popIn, fadeUp } from '@/shared/motion/presets'
import BrandLogo from '@/shared/components/BrandLogo.vue'

const { t } = useI18n()
</script>

<template>
  <v-main class="auth-main">
    <div class="auth-bg" aria-hidden="true">
      <div v-motion v-bind="withDelay(fadeIn, 0)" class="auth-sun" />
      <div v-motion v-bind="withDelay(popIn, 80)" class="auth-orb auth-orb--sage" />
      <div v-motion v-bind="withDelay(popIn, 160)" class="auth-orb auth-orb--peach" />
      <div v-motion v-bind="withDelay(popIn, 240)" class="auth-orb auth-orb--sky" />
      <div v-motion v-bind="withDelay(popIn, 320)" class="auth-orb auth-orb--lavender" />
      <div class="auth-haze" />
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 900, delay: 200 } }"
        class="auth-hills"
      />
    </div>

    <div class="auth-center">
      <div
        v-motion
        v-bind="withDelay(fadeUp, 80)"
        class="auth-hero d-none d-md-flex"
      >
        <BrandLogo :size="72" stacked>
          <template #tagline>
            <div class="auth-hero__tag">{{ t('app.tagline') }}</div>
          </template>
        </BrandLogo>
        <p class="auth-hero__copy mt-6">
          {{ t('login.subtitle') }}
        </p>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, y: 28, scale: 0.97 }"
        :enter="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 110, damping: 16, delay: 180 },
        }"
        class="auth-panel"
      >
        <RouterView />
      </div>
    </div>
  </v-main>
</template>

<style scoped>
.auth-main {
  position: relative;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--cx-bg);
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      #d5e4d4 0%,
      #e8efe6 36%,
      #f3ebe1 70%,
      #efc4a055 100%
    );
}

.auth-sun {
  position: absolute;
  top: 12%;
  right: 14%;
  width: min(28vw, 180px);
  height: min(28vw, 180px);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff6d8, #efc4a0 55%, transparent 70%);
  opacity: 0.85;
  animation: drift 18s ease-in-out infinite alternate;
}

.auth-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.55;
}

.auth-orb--sage {
  width: 42vw;
  height: 42vw;
  max-width: 420px;
  max-height: 420px;
  left: -10%;
  top: 18%;
  background: radial-gradient(circle, #7f9f7caa, transparent 70%);
  animation: floatA 16s ease-in-out infinite;
}

.auth-orb--peach {
  width: 36vw;
  height: 36vw;
  max-width: 340px;
  max-height: 340px;
  right: -8%;
  bottom: 22%;
  background: radial-gradient(circle, #efc4a0bb, transparent 70%);
  animation: floatB 20s ease-in-out infinite;
}

.auth-orb--sky {
  width: 28vw;
  height: 28vw;
  max-width: 260px;
  max-height: 260px;
  left: 30%;
  top: 8%;
  background: radial-gradient(circle, #a8d4e6aa, transparent 70%);
  animation: floatC 22s ease-in-out infinite;
}

.auth-orb--lavender {
  width: 24vw;
  height: 24vw;
  max-width: 220px;
  max-height: 220px;
  right: 28%;
  top: 40%;
  background: radial-gradient(circle, #d4c5e299, transparent 70%);
  animation: floatA 24s ease-in-out infinite reverse;
}

.auth-haze {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 120%, #f7f4efee 0%, transparent 55%);
}

.auth-hills {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -4%;
  height: 34%;
  background:
    radial-gradient(120% 80% at 20% 100%, #7f9f7c66 0%, transparent 55%),
    radial-gradient(100% 70% at 70% 100%, #4f6b4c55 0%, transparent 50%),
    radial-gradient(90% 60% at 50% 120%, #b5cfb588 0%, transparent 45%);
  animation: breathe 14s ease-in-out infinite;
}

.auth-center {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: flex;
  align-items: safe center;
  justify-content: center;
  padding: 24px 16px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  gap: 48px;
}

@media (max-height: 700px) {
  .auth-center {
    align-items: flex-start;
    padding-top: 20px;
  }
}

.auth-hero {
  flex-direction: column;
  justify-content: center;
  max-width: 380px;
  padding: 24px;
}

.auth-hero__tag {
  font-size: 1rem;
  color: var(--cx-text-soft);
  margin-top: 6px;
  max-width: 280px;
  line-height: 1.4;
}

.auth-hero__copy {
  font-size: 1.15rem;
  line-height: 1.5;
  color: var(--cx-primary-deep);
  font-weight: 600;
  max-width: 320px;
}

.auth-panel {
  width: 100%;
  max-width: 420px;
}

@media (min-width: 960px) {
  .auth-center {
    justify-content: center;
    padding: 48px;
  }

  .auth-panel {
    max-width: 440px;
  }
}

@media (min-width: 1280px) {
  .auth-center {
    gap: 80px;
  }
}

@keyframes floatA {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(18px, -24px, 0) scale(1.05); }
  100% { transform: translate3d(-10px, 12px, 0) scale(0.98); }
}

@keyframes floatB {
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-22px, -16px, 0); }
  100% { transform: translate3d(14px, 10px, 0); }
}

@keyframes floatC {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(12px, 20px, 0) scale(1.08); }
  100% { transform: translate3d(-16px, -8px, 0) scale(1); }
}

@keyframes drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-20px, 16px, 0); }
}

@keyframes breathe {
  0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.9; }
  50% { transform: translateY(-8px) scaleX(1.02); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .auth-sun,
  .auth-orb,
  .auth-hills {
    animation: none;
  }
}
</style>
