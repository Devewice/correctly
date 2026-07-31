<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import {
  COMPANIONS,
  COMPANION_CATEGORIES,
  COMPANION_NONE,
  COMPANION_PALETTES,
  BODY_PARTS,
  EAR_PARTS,
  LEG_PARTS,
  TAIL_PARTS,
  companionsByCategory,
  resolveCompanionAppearance,
} from '@/shared/data/companions'
import {
  companionAppearance,
  companionCustom,
  companionName,
  companionPetId,
  setCompanionCustom,
  setCompanionName,
  setCompanionPet,
} from '@/shared/companions/companionBus'
import { completeDiscoveryTip } from '@/shared/discovery/notifyDiscovery'
import CompanionBuddy from '@/shared/components/CompanionBuddy.vue'

const { t, te } = useI18n()
const auth = useAuthStore()

const speciesFilter = ref('all')
const customizeOpen = ref(false)
const nameDraft = ref(companionName.value || '')

const customDraft = reactive({
  body: 'round',
  ears: 'cat',
  legs: 'walk',
  tail: 'cat',
  accent: '#7f9f7c',
  accent2: '#4a6648',
})

const speciesList = computed(() => ['all', ...COMPANION_CATEGORIES])

const filtered = computed(() => companionsByCategory(speciesFilter.value))

const previewLook = computed(() => ({
  id: 'custom',
  name: nameDraft.value.trim() || companionAppearance.value?.name || '…',
  species: 'custom',
  body: customDraft.body,
  ears: customDraft.ears,
  legs: customDraft.legs,
  tail: customDraft.tail,
  accent: customDraft.accent,
  accent2: customDraft.accent2,
}))

watch(companionName, (v) => {
  nameDraft.value = v || ''
})

function pick(id) {
  setCompanionPet(auth.user?.id, id)
  completeDiscoveryTip(auth.user?.id, 'companions', 'companionChosen')
  if (id !== COMPANION_NONE) {
    const look = resolveCompanionAppearance({ companionPetId: id })
    if (look) {
      customDraft.body = look.body
      customDraft.ears = look.ears
      customDraft.legs = look.legs
      customDraft.tail = look.tail
      customDraft.accent = look.accent
      customDraft.accent2 = look.accent2
    }
  }
}

function saveName() {
  setCompanionName(auth.user?.id, nameDraft.value)
  completeDiscoveryTip(auth.user?.id, 'companions', 'companionChosen')
}

function openCustomize() {
  const look = companionAppearance.value
  if (look) {
    customDraft.body = look.body
    customDraft.ears = look.ears
    customDraft.legs = look.legs
    customDraft.tail = look.tail
    customDraft.accent = look.accent
    customDraft.accent2 = look.accent2
  } else if (companionCustom.value) {
    Object.assign(customDraft, companionCustom.value)
  }
  nameDraft.value = companionName.value || look?.name || ''
  customizeOpen.value = true
}

function applyCustom() {
  if (companionPetId.value === COMPANION_NONE) {
    setCompanionPet(auth.user?.id, 'moka')
  }
  setCompanionCustom(auth.user?.id, { ...customDraft })
  setCompanionName(auth.user?.id, nameDraft.value)
  completeDiscoveryTip(auth.user?.id, 'companions', 'companionChosen')
  customizeOpen.value = false
}

function resetCustom() {
  setCompanionCustom(auth.user?.id, null)
  const look = resolveCompanionAppearance({ companionPetId: companionPetId.value })
  if (look) {
    customDraft.body = look.body
    customDraft.ears = look.ears
    customDraft.legs = look.legs
    customDraft.tail = look.tail
    customDraft.accent = look.accent
    customDraft.accent2 = look.accent2
  }
}

function pickPalette(pal) {
  customDraft.accent = pal.accent
  customDraft.accent2 = pal.accent2
}

function speciesLabel(s) {
  if (s === 'all') return t('companions.filterAll')
  const k = `companions.species.${s}`
  return te(k) ? t(k) : s
}
</script>

<template>
  <section class="cx-section">
    <p class="cx-section-label">{{ t('companions.title') }}</p>
    <p class="text-body-2 text-medium-emphasis mb-3">{{ t('companions.hint') }}</p>

    <div class="d-flex align-center ga-3 mb-3">
      <CompanionBuddy
        v-if="companionPetId !== COMPANION_NONE && companionAppearance"
        preview
        show-bubble
        mood="happy"
        :appearance="companionAppearance"
      />
      <div class="flex-grow-1">
        <v-text-field
          v-model="nameDraft"
          :label="t('companions.nameLabel')"
          :placeholder="t('companions.namePlaceholder')"
          maxlength="24"
          density="comfortable"
          hide-details
          :disabled="companionPetId === COMPANION_NONE"
          @blur="saveName"
          @keyup.enter="saveName"
        />
      </div>
    </div>

    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn
        size="small"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-palette-outline"
        :disabled="companionPetId === COMPANION_NONE"
        @click="openCustomize"
      >
        {{ t('companions.customize') }}
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        :class="{ 'text-primary': companionPetId === COMPANION_NONE }"
        @click="pick(COMPANION_NONE)"
      >
        {{ t('companions.none') }}
      </v-btn>
    </div>

    <div class="species-scroll mb-2">
      <button
        v-for="s in speciesList"
        :key="s"
        type="button"
        class="species-chip"
        :class="{ 'species-chip--on': speciesFilter === s }"
        @click="speciesFilter = s"
      >
        {{ speciesLabel(s) }}
      </button>
    </div>

    <div class="companion-grid">
      <button
        v-for="c in filtered"
        :key="c.id"
        type="button"
        class="companion-pick__item"
        :class="{ 'companion-pick__item--on': companionPetId === c.id && !companionCustom }"
        @click="pick(c.id)"
      >
        <CompanionBuddy preview thumb :pet-id="c.id" mood="idle" />
        <span class="companion-pick__name">{{ c.name }}</span>
      </button>
    </div>
    <p class="text-caption text-medium-emphasis mt-2 mb-0">
      {{ t('companions.count', { n: COMPANIONS.length }) }}
    </p>
  </section>

  <v-dialog v-model="customizeOpen" max-width="480" scrollable>
    <v-card class="pa-4">
      <p class="text-h6 mb-1">{{ t('companions.customizeTitle') }}</p>
      <p class="text-body-2 text-medium-emphasis mb-3">{{ t('companions.customizeHint') }}</p>

      <div class="d-flex justify-center mb-3">
        <CompanionBuddy preview show-bubble mood="wave" :appearance="previewLook" />
      </div>

      <v-text-field
        v-model="nameDraft"
        :label="t('companions.nameLabel')"
        maxlength="24"
        class="mb-3"
      />

      <p class="text-caption font-weight-bold mb-1">{{ t('companions.partBody') }}</p>
      <div class="part-row mb-3">
        <button
          v-for="p in BODY_PARTS"
          :key="p"
          type="button"
          class="part-chip"
          :class="{ 'part-chip--on': customDraft.body === p }"
          @click="customDraft.body = p"
        >
          {{ t(`companions.parts.body.${p}`) }}
        </button>
      </div>

      <p class="text-caption font-weight-bold mb-1">{{ t('companions.partEars') }}</p>
      <div class="part-row mb-3">
        <button
          v-for="p in EAR_PARTS"
          :key="p"
          type="button"
          class="part-chip"
          :class="{ 'part-chip--on': customDraft.ears === p }"
          @click="customDraft.ears = p"
        >
          {{ t(`companions.parts.ears.${p}`) }}
        </button>
      </div>

      <p class="text-caption font-weight-bold mb-1">{{ t('companions.partLegs') }}</p>
      <div class="part-row mb-3">
        <button
          v-for="p in LEG_PARTS"
          :key="p"
          type="button"
          class="part-chip"
          :class="{ 'part-chip--on': customDraft.legs === p }"
          @click="customDraft.legs = p"
        >
          {{ t(`companions.parts.legs.${p}`) }}
        </button>
      </div>

      <p class="text-caption font-weight-bold mb-1">{{ t('companions.partTail') }}</p>
      <div class="part-row mb-3">
        <button
          v-for="p in TAIL_PARTS"
          :key="p"
          type="button"
          class="part-chip"
          :class="{ 'part-chip--on': customDraft.tail === p }"
          @click="customDraft.tail = p"
        >
          {{ t(`companions.parts.tail.${p}`) }}
        </button>
      </div>

      <p class="text-caption font-weight-bold mb-1">{{ t('companions.partColors') }}</p>
      <div class="palette-row mb-4">
        <button
          v-for="pal in COMPANION_PALETTES"
          :key="pal.id"
          type="button"
          class="palette-dot"
          :class="{
            'palette-dot--on':
              customDraft.accent === pal.accent && customDraft.accent2 === pal.accent2,
          }"
          :style="{ background: `linear-gradient(135deg, ${pal.accent}, ${pal.accent2})` }"
          :aria-label="pal.id"
          @click="pickPalette(pal)"
        />
      </div>

      <div class="d-flex flex-wrap justify-end ga-2">
        <v-btn variant="text" @click="resetCustom">{{ t('companions.resetCustom') }}</v-btn>
        <v-btn variant="text" @click="customizeOpen = false">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" @click="applyCustom">{{ t('companions.applyCustom') }}</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.species-scroll {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: thin;
}

.species-chip,
.part-chip {
  flex: 0 0 auto;
  border: 1px solid var(--cx-border);
  background: color-mix(in srgb, var(--cx-surface) 90%, var(--cx-bg));
  color: var(--cx-text);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.species-chip--on,
.part-chip--on {
  border-color: color-mix(in srgb, var(--cx-primary) 55%, var(--cx-border));
  background: color-mix(in srgb, var(--cx-primary-soft) 80%, var(--cx-surface));
}

.companion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 0.15rem;
}

.companion-pick__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.35rem 0.2rem 0.45rem;
  border-radius: var(--cx-radius-md, 14px);
  border: 1px solid var(--cx-border);
  background: color-mix(in srgb, var(--cx-surface) 92%, var(--cx-bg));
  cursor: pointer;
  color: var(--cx-text);
}

.companion-pick__item--on {
  border-color: color-mix(in srgb, var(--cx-primary) 55%, var(--cx-border));
  background: color-mix(in srgb, var(--cx-primary-soft) 75%, var(--cx-surface));
}

.companion-pick__name {
  font-size: 0.68rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.15;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.part-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.palette-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.palette-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.palette-dot--on {
  border-color: var(--cx-primary-deep);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--cx-primary) 35%, transparent);
}

@media (min-width: 600px) {
  .companion-grid {
    grid-template-columns: repeat(6, 1fr);
    max-height: 320px;
  }
}
</style>
