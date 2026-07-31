<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const status = ref('loading')
const friendName = ref('')
const error = ref('')

onMounted(async () => {
  const code = typeof route.query.code === 'string' ? route.query.code : ''
  if (!code) {
    status.value = 'error'
    error.value = t('friends.badCode')
    return
  }
  try {
    const data = await api('/friends/accept', { method: 'POST', body: { code } })
    friendName.value = data.friend?.name || ''
    status.value = data.alreadyFriends ? 'already' : 'ok'
    setTimeout(() => router.replace({ name: 'friends' }), 1600)
  } catch (e) {
    status.value = 'error'
    error.value = e.message || t('common.error')
  }
})
</script>

<template>
  <PageHeader :title="t('friends.joinTitle')" :subtitle="t('friends.joinSubtitle')" />

  <v-card class="pa-6 text-center">
    <div v-if="status === 'loading'" class="text-medium-emphasis">{{ t('common.loading') }}</div>
    <div v-else-if="status === 'ok'">
      <div class="text-h5 mb-2">🎉</div>
      <div class="text-subtitle-1 font-weight-bold">{{ t('friends.joinOk', { name: friendName }) }}</div>
    </div>
    <div v-else-if="status === 'already'">
      <div class="text-subtitle-1 font-weight-bold">{{ t('friends.joinAlready', { name: friendName }) }}</div>
    </div>
    <div v-else>
      <v-alert type="error" variant="tonal">{{ error }}</v-alert>
      <v-btn class="mt-4" color="primary" to="/friends">{{ t('friends.title') }}</v-btn>
    </div>
  </v-card>
</template>
