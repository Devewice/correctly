<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <v-main>
    <v-container class="fill-height py-10" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5" lg="4">
          <RouterView />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
