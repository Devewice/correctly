<script setup>
import { RouterView } from 'vue-router'
import RemindersBootstrap from '@/shared/components/RemindersBootstrap.vue'
</script>

<template>
  <v-app>
    <RemindersBootstrap />
    <RouterView />
  </v-app>
</template>
