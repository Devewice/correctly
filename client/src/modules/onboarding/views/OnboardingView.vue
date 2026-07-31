<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { setLocale } from '@/plugins/i18n'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const step = ref(0)
const busy = ref(false)

const form = reactive({
  language: locale.value,
  activeModules: ['meals', 'water', 'mood', 'sleep', 'habits'],
  wakeTime: '07:00',
  sleepTime: '23:00',
  mainGoal: '',
  habits: [
    { name: 'Vitaminas', icon: '💊' },
    { name: 'Leer 15 min', icon: '📖' },
    { name: 'Estiramiento', icon: '🧘' },
  ],
})

const moduleKeys = ['meals', 'water', 'mood', 'sleep', 'habits', 'activity', 'journal', 'meditation']

function toggleModule(key) {
  const i = form.activeModules.indexOf(key)
  if (i >= 0) form.activeModules.splice(i, 1)
  else form.activeModules.push(key)
}

async function finish() {
  busy.value = true
  try {
    setLocale(form.language)
    const data = await api('/user/onboarding', {
      method: 'PUT',
      body: {
        language: form.language,
        activeModules: form.activeModules,
        wakeTime: form.wakeTime,
        sleepTime: form.sleepTime,
        mainGoal: form.mainGoal || undefined,
        habits: form.activeModules.includes('habits') ? form.habits : [],
      },
    })
    auth.user = data.user
    router.push('/dashboard')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <v-main>
  <v-container class="fill-height py-4 py-sm-10 px-3" style="max-width: 520px">
    <v-card
      v-motion
      :initial="{ opacity: 0, y: 28, scale: 0.97 }"
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 120, damping: 16 },
      }"
      class="pa-4 pa-sm-8 w-100"
    >
      <div
        v-motion
        v-bind="withDelay(fadeUp, 60)"
        class="text-caption text-primary text-uppercase font-weight-bold"
      >
        {{ t('app.name') }}
      </div>
      <h1
        v-motion
        v-bind="withDelay(fadeUp, 120)"
        class="text-h4 font-weight-bold mt-2"
      >
        {{ t('onboarding.welcome') }}
      </h1>

      <v-window v-model="step" class="mt-6">
        <v-window-item :value="0">
          <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.language') }}</p>
          <div class="d-flex ga-2 mb-6">
            <v-chip
              v-for="lang in ['es', 'en', 'pt']"
              :key="lang"
              :color="form.language === lang ? 'primary' : undefined"
              :variant="form.language === lang ? 'flat' : 'tonal'"
              label
              @click="form.language = lang; setLocale(lang)"
            >
              {{ lang }}
            </v-chip>
          </div>
          <v-btn block color="primary" size="large" @click="step = 1">
            {{ t('onboarding.continue') }}
          </v-btn>
        </v-window-item>

        <v-window-item :value="1">
          <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.modules') }}</p>
          <v-row dense class="mb-6">
            <v-col v-for="key in moduleKeys" :key="key" cols="6">
              <v-card
                :color="form.activeModules.includes(key) ? 'primary' : undefined"
                :variant="form.activeModules.includes(key) ? 'tonal' : 'outlined'"
                class="pa-3"
                @click="toggleModule(key)"
              >
                <div class="text-body-2">{{ t(`modules.${key}`) }}</div>
              </v-card>
            </v-col>
          </v-row>
          <v-btn block color="primary" size="large" @click="step = 2">
            {{ t('onboarding.continue') }}
          </v-btn>
        </v-window-item>

        <v-window-item :value="2">
          <p class="text-body-2 text-medium-emphasis mb-3">{{ t('onboarding.routines') }}</p>
          <v-text-field
            v-model="form.wakeTime"
            type="time"
            :label="t('onboarding.wake')"
            class="mb-2"
          />
          <v-text-field
            v-model="form.sleepTime"
            type="time"
            :label="t('onboarding.sleep')"
            class="mb-2"
          />
          <v-text-field
            v-model="form.mainGoal"
            :label="t('onboarding.goal')"
            class="mb-4"
          />
          <v-btn
            block
            color="primary"
            size="large"
            :loading="busy"
            :disabled="!form.activeModules.length"
            @click="finish"
          >
            {{ t('onboarding.finish') }}
          </v-btn>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
  </v-main>
</template>
