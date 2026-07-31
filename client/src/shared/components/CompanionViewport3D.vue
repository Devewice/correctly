<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import {
  animateCompanionMesh,
  buildCompanionMesh,
} from '@/shared/companions/buildCompanionMesh'

const props = defineProps({
  appearance: { type: Object, required: true },
  mood: { type: String, default: 'idle' },
  /** preview = más pequeño, menos resolución */
  preview: { type: Boolean, default: false },
})

const host = ref(null)
let renderer
let scene
let camera
let mesh
let raf = 0
let disposed = false
const clock = new THREE.Clock()

function clearMesh() {
  if (!mesh || !scene) return
  scene.remove(mesh)
  mesh.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material.dispose()
    }
  })
  mesh = null
}

function rebuild() {
  if (!scene || !props.appearance) return
  clearMesh()
  mesh = buildCompanionMesh(props.appearance)
  scene.add(mesh)
}

function resize() {
  if (!host.value || !renderer || !camera) return
  const w = host.value.clientWidth || 88
  const h = host.value.clientHeight || 96
  const dpr = Math.min(window.devicePixelRatio || 1, props.preview ? 1.5 : 2)
  renderer.setPixelRatio(dpr)
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function loop() {
  if (disposed) return
  const t = clock.getElapsedTime()
  const dt = Math.min(0.05, clock.getDelta())
  if (mesh) {
    animateCompanionMesh(mesh, props.mood, t, dt)
  }
  renderer.render(scene, camera)
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  if (!host.value) return
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20)
  camera.position.set(0, 0.85, 3.1)
  camera.lookAt(0, 0.55, 0)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = !props.preview
  host.value.appendChild(renderer.domElement)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'

  const hemi = new THREE.HemisphereLight(0xfff6ea, 0x6b7a68, 0.95)
  scene.add(hemi)
  const key = new THREE.DirectionalLight(0xffffff, 1.05)
  key.position.set(2.2, 4, 2.5)
  key.castShadow = !props.preview
  if (key.castShadow) {
    key.shadow.mapSize.set(512, 512)
  }
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xc9b8d8, 0.35)
  fill.position.set(-2, 1.5, -1)
  scene.add(fill)

  rebuild()
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host.value)
  host.value._ro = ro
  clock.start()
  loop()
})

watch(
  () => props.appearance,
  () => rebuild(),
  { deep: true },
)

onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(raf)
  host.value?._ro?.disconnect()
  clearMesh()
  renderer?.dispose()
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  renderer = null
  scene = null
  camera = null
})
</script>

<template>
  <div ref="host" class="buddy3d" aria-hidden="true" />
</template>

<style scoped>
.buddy3d {
  width: 100%;
  height: 100%;
  min-height: 72px;
}
.buddy3d :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}
</style>
