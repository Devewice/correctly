<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <v-main class="auth-main">
    <div class="auth-bg" aria-hidden="true">
      <div class="auth-sun" />
      <div class="auth-orb auth-orb--sage" />
      <div class="auth-orb auth-orb--peach" />
      <div class="auth-orb auth-orb--sky" />
      <div class="auth-orb auth-orb--lavender" />
      <div class="auth-haze" />
      <div class="auth-hills" />
    </div>

    <div class="auth-center">
      <div class="auth-panel">
        <RouterView />
      </div>
    </div>
  </v-main>
</template>

<style scoped>
.auth-main {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #e8f0e6;
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      #cfe0d8 0%,
      #e8f0e6 38%,
      #f5ede3 72%,
      #f4cba855 100%
    );
}

.auth-sun {
  position: absolute;
  top: 12%;
  right: 14%;
  width: min(28vw, 180px);
  height: min(28vw, 180px);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff6d8, #f4cba8 55%, transparent 70%);
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
  background: radial-gradient(circle, #8ba888aa, transparent 70%);
  animation: floatA 16s ease-in-out infinite;
}

.auth-orb--peach {
  width: 36vw;
  height: 36vw;
  max-width: 340px;
  max-height: 340px;
  right: -8%;
  bottom: 22%;
  background: radial-gradient(circle, #f4cba8bb, transparent 70%);
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
  background: radial-gradient(ellipse at 50% 120%, #faf8f5ee 0%, transparent 55%);
}

.auth-hills {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -4%;
  height: 34%;
  background:
    radial-gradient(120% 80% at 20% 100%, #8ba88866 0%, transparent 55%),
    radial-gradient(100% 70% at 70% 100%, #5e7a5b55 0%, transparent 50%),
    radial-gradient(90% 60% at 50% 120%, #b5cfb588 0%, transparent 45%);
  animation: breathe 14s ease-in-out infinite;
}

.auth-center {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.auth-panel {
  width: 100%;
  max-width: 420px;
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
