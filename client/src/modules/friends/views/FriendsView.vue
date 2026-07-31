<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()

const loading = ref(true)
const busy = ref(false)
const friends = ref([])
const invite = ref(null)
const stats = ref({ likesReceived: 0, dislikesReceived: 0 })
const feed = ref([])
const mine = ref(null)
const canPost = ref(true)
const note = ref('')
const preview = ref(null)
const imageBase64 = ref(null)
const copied = ref(false)
const error = ref('')
const fileInput = ref(null)

const hasDraft = computed(() => Boolean(note.value.trim() || imageBase64.value))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [list, day] = await Promise.all([api('/friends'), api('/friends/feed')])
    friends.value = list.friends
    invite.value = list.invite
    stats.value = list.stats
    feed.value = day.feed
    mine.value = day.mine
    canPost.value = day.canPost
  } catch (e) {
    error.value = e.message || t('common.error')
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  if (!invite.value?.link) return
  try {
    await navigator.clipboard.writeText(invite.value.link)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    error.value = t('friends.copyFail')
  }
}

async function refreshInvite() {
  busy.value = true
  try {
    const data = await api('/friends/invite', { method: 'POST' })
    invite.value = data.invite
  } finally {
    busy.value = false
  }
}

function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = t('friends.badImage')
    return
  }
  if (file.size > 2.5 * 1024 * 1024) {
    error.value = t('friends.imageTooBig')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    imageBase64.value = String(reader.result)
    preview.value = String(reader.result)
  }
  reader.readAsDataURL(file)
}

function clearPhoto() {
  imageBase64.value = null
  preview.value = null
}

async function publish() {
  if (!hasDraft.value || !canPost.value) return
  busy.value = true
  error.value = ''
  try {
    const data = await api('/friends/share', {
      method: 'POST',
      body: {
        note: note.value.trim() || undefined,
        imageBase64: imageBase64.value || undefined,
      },
    })
    mine.value = data.share
    canPost.value = false
    note.value = ''
    clearPhoto()
  } catch (e) {
    error.value = e.status === 409 ? t('friends.alreadyToday') : e.message || t('common.error')
  } finally {
    busy.value = false
  }
}

async function react(share, type) {
  try {
    const data = await api(`/friends/share/${share.id}/react`, {
      method: 'POST',
      body: { type },
    })
    const idx = feed.value.findIndex((s) => s.id === share.id)
    if (idx >= 0) feed.value[idx] = data.share
  } catch (e) {
    error.value = e.message || t('common.error')
  }
}

async function removeFriend(id) {
  busy.value = true
  try {
    await api(`/friends/${id}`, { method: 'DELETE' })
    friends.value = friends.value.filter((f) => f.id !== id)
    feed.value = feed.value.filter((s) => s.user.id !== id)
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader :title="t('friends.title')" :subtitle="t('friends.subtitle')" />

  <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">
    {{ error }}
  </v-alert>

  <div v-if="loading" class="text-medium-emphasis">{{ t('common.loading') }}</div>

  <template v-else>
    <section class="cx-section">
      <v-row dense class="align-stretch">
        <v-col cols="6">
          <v-card class="pa-3 pa-sm-4 cx-stat-card" color="secondary" variant="tonal">
            <div class="cx-stat-card__label">{{ t('friends.likesStat') }}</div>
            <div class="cx-stat-card__value">{{ stats.likesReceived }}</div>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card class="pa-3 pa-sm-4 cx-stat-card" color="secondary" variant="tonal">
            <div class="cx-stat-card__label">{{ t('friends.dislikesStat') }}</div>
            <div class="cx-stat-card__value">{{ stats.dislikesReceived }}</div>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section class="cx-section">
      <p class="cx-section-label">{{ t('friends.inviteTitle') }}</p>
      <div class="cx-panel">
        <p class="text-body-2 text-medium-emphasis mb-3">{{ t('friends.inviteHint') }}</p>
        <v-text-field
          :model-value="invite?.link || ''"
          readonly
          density="comfortable"
          hide-details
          class="mb-3"
        />
        <div class="d-flex flex-wrap ga-2">
          <v-btn color="primary" :loading="busy" @click="copyLink">
            {{ copied ? t('friends.copied') : t('friends.copyLink') }}
          </v-btn>
          <v-btn variant="text" :loading="busy" @click="refreshInvite">
            {{ t('friends.newLink') }}
          </v-btn>
        </div>
      </div>
    </section>

    <section v-if="canPost" class="cx-section">
      <p class="cx-section-label">{{ t('friends.todayTitle') }}</p>
      <p class="text-body-2 text-medium-emphasis mb-3">{{ t('friends.checkInHint') }}</p>
      <v-card class="pa-4 pa-sm-5 cx-panel--lift">
        <v-textarea
          v-model="note"
          :label="t('friends.noteLabel')"
          :placeholder="t('friends.notePlaceholder')"
          rows="2"
          auto-grow
          class="mb-3"
        />
        <div v-if="preview" class="mb-3">
          <v-img :src="preview" max-height="240" cover class="rounded-lg mb-2" />
          <v-btn size="small" variant="text" @click="clearPhoto">{{ t('friends.removePhoto') }}</v-btn>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile" />
        <div class="d-flex flex-wrap ga-2 align-center">
          <v-btn variant="tonal" prepend-icon="mdi-camera-outline" @click="fileInput?.click()">
            {{ t('friends.addPhoto') }}
          </v-btn>
          <v-btn color="primary" :disabled="!hasDraft" :loading="busy" @click="publish">
            {{ t('friends.publish') }}
          </v-btn>
        </div>
      </v-card>
    </section>

    <section v-else-if="mine" class="cx-section">
      <p class="cx-section-label">{{ t('friends.yourShare') }}</p>
      <div class="cx-panel cx-panel--warm">
        <p v-if="mine.note" class="text-body-1 mb-3">{{ mine.note }}</p>
        <v-img v-if="mine.photoUrl" :src="mine.photoUrl" max-height="280" cover class="rounded-lg mb-3" />
        <div class="text-caption text-medium-emphasis">
          {{ t('friends.noDelete') }} · {{ mine.likes }} · {{ mine.dislikes }}
        </div>
      </div>
    </section>

    <section class="cx-section">
      <p class="cx-section-label">{{ t('friends.feedTitle') }}</p>
      <v-alert v-if="!feed.length" type="info" variant="tonal" class="mb-0">
        {{ t('friends.feedEmpty') }}
      </v-alert>
      <div
        v-for="(share, i) in feed"
        :key="share.id"
        v-motion
        v-bind="{ ...softHover, ...withDelay(fadeUp, 60 + i * 50) }"
        class="cx-log mb-3"
      >
        <div class="d-flex align-center ga-3 mb-3">
          <v-avatar size="40" color="primary" variant="tonal">
            <v-img v-if="share.user.avatar" :src="share.user.avatar" />
            <span v-else>{{ share.user.name?.charAt(0) }}</span>
          </v-avatar>
          <div class="font-weight-medium">{{ share.user.name }}</div>
        </div>
        <p v-if="share.note" class="text-body-1 mb-3">{{ share.note }}</p>
        <v-img v-if="share.photoUrl" :src="share.photoUrl" max-height="280" cover class="rounded-lg mb-3" />
        <div class="d-flex flex-wrap ga-2">
          <v-btn
            size="small"
            :color="share.myReaction === 'like' ? 'success' : undefined"
            :variant="share.myReaction === 'like' ? 'flat' : 'tonal'"
            prepend-icon="mdi-heart"
            @click="react(share, 'like')"
          >
            {{ t('friends.reactCheer') }} · {{ share.likes }}
          </v-btn>
          <v-btn
            size="small"
            :color="share.myReaction === 'dislike' ? 'secondary' : undefined"
            :variant="share.myReaction === 'dislike' ? 'flat' : 'tonal'"
            prepend-icon="mdi-arm-flex"
            @click="react(share, 'dislike')"
          >
            {{ t('friends.reactStrength') }} · {{ share.dislikes }}
          </v-btn>
        </div>
      </div>
    </section>

    <section class="cx-section">
      <p class="cx-section-label">{{ t('friends.listTitle') }}</p>
      <v-alert v-if="!friends.length" type="info" variant="tonal">
        {{ t('friends.listEmpty') }}
      </v-alert>
      <v-list v-else>
        <v-list-item v-for="f in friends" :key="f.id">
          <template #prepend>
            <v-avatar size="40" color="primary" variant="tonal">
              <v-img v-if="f.avatar" :src="f.avatar" />
              <span v-else>{{ f.name?.charAt(0) }}</span>
            </v-avatar>
          </template>
          <v-list-item-title>{{ f.name }}</v-list-item-title>
          <template #append>
            <v-btn size="small" variant="text" color="error" @click="removeFriend(f.id)">
              {{ t('friends.remove') }}
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </section>
  </template>
</template>
