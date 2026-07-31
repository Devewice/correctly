<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from 'vuetify'
import RemindersBootstrap from '@/shared/components/RemindersBootstrap.vue'
import {
  applyTheme,
  loadThemeMode,
} from '@/shared/theme/themePrefs'

const theme = useTheme()
let mq

function syncTheme() {
  applyTheme(theme, loadThemeMode())
}

onMounted(() => {
  syncTheme()
  mq = window.matchMedia?.('(prefers-color-scheme: dark)')
  mq?.addEventListener?.('change', syncTheme)
})

onUnmounted(() => {
  mq?.removeEventListener?.('change', syncTheme)
})
</script>

<template>
  <v-app>
    <RemindersBootstrap />
    <RouterView />
  </v-app>
</template>
