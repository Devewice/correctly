<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const users = ref([])
const error = ref('')

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
  <div>
    <h2 class="mb-4 font-display text-2xl font-extrabold">{{ t('admin.users.title') }}</h2>
    <p v-if="error" class="mb-3 text-sm text-danger">{{ error }}</p>
    <ul class="space-y-2">
      <li
        v-for="u in users"
        :key="u.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5"
      >
        <div>
          <p class="font-medium">{{ u.name }}</p>
          <p class="text-xs text-muted">{{ u.email }}</p>
        </div>
        <select
          class="rounded-xl bg-sand px-3 py-2 text-sm"
          :value="u.role"
          :disabled="u.id === auth.user?.id"
          @change="setRole(u, $event.target.value)"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
          <option value="superadmin">superadmin</option>
        </select>
      </li>
    </ul>
  </div>
</template>
