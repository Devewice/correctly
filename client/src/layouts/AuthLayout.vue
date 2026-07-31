<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <v-main class="auth-layout">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5" lg="4">
          <RouterView />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background:
    radial-gradient(900px 500px at 10% -10%, #f4cba855, transparent 55%),
    radial-gradient(700px 400px at 90% 0%, #d4c5e244, transparent 50%),
    #faf8f5;
}
</style>
