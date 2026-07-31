<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'

const { t } = useI18n()
const auth = useAuthStore()
const users = ref([])
const error = ref('')

const roles = [
  { title: 'user', value: 'user' },
  { title: 'admin', value: 'admin' },
  { title: 'superadmin', value: 'superadmin' },
]

async function load() {
  const data = await api('/admin/users')
  users.value = data.users
}

async function setRole(user, role) {
  try {
    await api(`/admin/users/${user.id}/role`, {
      method: 'PATCH',
      body: { role },
    })
    await load()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(load)
</script>

<template>
  <h2 class="text-h5 font-weight-bold mb-4">{{ t('admin.users.title') }}</h2>
  <v-alert v-if="error" type="error" variant="tonal" class="mb-3" density="compact">
    {{ error }}
  </v-alert>

  <v-card v-for="u in users" :key="u.id" class="pa-4 mb-2">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3">
      <div>
        <div class="font-weight-medium">{{ u.name }}</div>
        <div class="text-caption text-medium-emphasis">{{ u.email }}</div>
      </div>
      <v-select
        :model-value="u.role"
        :items="roles"
        density="compact"
        style="max-width: 160px"
        :disabled="u.id === auth.user?.id"
        hide-details
        @update:model-value="setRole(u, $event)"
      />
    </div>
  </v-card>
</template>
