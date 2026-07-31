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

function roleIcon(role) {
  if (role === 'superadmin') return 'mdi-shield-crown-outline'
  if (role === 'admin') return 'mdi-shield-account-outline'
  return 'mdi-account-outline'
}

onMounted(load)
</script>

<template>
  <header class="admin-page-head mb-4">
    <div class="admin-page-head__icon" aria-hidden="true">
      <v-icon icon="mdi-account-group-outline" color="primary" />
    </div>
    <div>
      <h2 class="text-h6 font-weight-bold mb-0">{{ t('admin.users.title') }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-0 mt-1">{{ t('admin.users.subtitle') }}</p>
    </div>
  </header>

  <v-alert v-if="error" type="error" variant="tonal" class="mb-3" density="compact">
    {{ error }}
  </v-alert>

  <div v-for="u in users" :key="u.id" class="cx-log mb-2">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3">
      <div class="d-flex align-center ga-3 min-w-0">
        <v-avatar color="primary" variant="tonal" size="42">
          <v-icon :icon="roleIcon(u.role)" />
        </v-avatar>
        <div class="min-w-0">
          <div class="font-weight-medium text-truncate">{{ u.name }}</div>
          <div class="text-caption text-medium-emphasis text-truncate">{{ u.email }}</div>
        </div>
      </div>
      <v-select
        :model-value="u.role"
        :items="roles"
        density="compact"
        style="max-width: 170px; min-width: 140px"
        :disabled="u.id === auth.user?.id"
        hide-details
        :prepend-inner-icon="roleIcon(u.role)"
        @update:model-value="setRole(u, $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.admin-page-head {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}
.admin-page-head__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--cx-primary-soft);
  flex-shrink: 0;
}
</style>
