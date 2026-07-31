import { computed, ref } from 'vue'

/**
 * Drag tipo Tinder para la card de guía.
 * Izquierda → skip. Derecha → rebound (feedback).
 */
export function useGuideSwipe({ canSkip, onSkip, threshold = 120 }) {
  const x = ref(0)
  const y = ref(0)
  const dragging = ref(false)
  const flying = ref(false)

  let startX = 0
  let startY = 0
  let tracking = false
  let axis = null
  let pointerId = null

  const progress = computed(() => Math.min(1, Math.abs(x.value) / threshold))
  const skipHint = computed(() => x.value < -28)
  const keepHint = computed(() => x.value > 28)
  const cardStyle = computed(() => {
    const rot = x.value * 0.05
    const draggingNow = dragging.value || flying.value
    return {
      transform: `translate3d(${x.value}px, ${y.value}px, 0) rotate(${rot}deg)`,
      transition: draggingNow ? 'none' : 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
      touchAction: 'pan-y',
      willChange: 'transform',
      cursor: canSkip?.value === false ? 'default' : dragging.value ? 'grabbing' : 'grab',
    }
  })

  function isInteractive(target) {
    return Boolean(
      target?.closest?.(
        'button, a, input, textarea, select, label, .v-btn, .v-field, .v-selection-control, .v-switch, .mood-tile, .select-tile',
      ),
    )
  }

  function reset() {
    x.value = 0
    y.value = 0
    dragging.value = false
    tracking = false
    axis = null
    pointerId = null
  }

  function onPointerDown(e) {
    if (flying.value) return
    if (canSkip && canSkip.value === false) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (isInteractive(e.target)) return
    tracking = true
    axis = null
    startX = e.clientX
    startY = e.clientY
    pointerId = e.pointerId
    dragging.value = true
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e) {
    if (!tracking || flying.value) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (!axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axis === 'y') {
        reset()
        return
      }
    }
    if (axis !== 'x') return
    e.preventDefault?.()
    x.value = dx
    y.value = dy * 0.12
  }

  function finish() {
    if (flying.value) return
    const skipOk = !canSkip || canSkip.value !== false
    if (skipOk && x.value <= -threshold) {
      flying.value = true
      dragging.value = false
      tracking = false
      axis = null
      x.value = -Math.min(typeof window !== 'undefined' ? window.innerWidth : 400, 520) * 0.88
      y.value = y.value + 18
      window.setTimeout(() => {
        onSkip?.({ fromSwipe: true })
        flying.value = false
        reset()
      }, 230)
      return
    }
    // Derecha o insuficiente: vuelve
    x.value = 0
    y.value = 0
    dragging.value = false
    tracking = false
    axis = null
  }

  function onPointerUp(e) {
    if (!tracking && !dragging.value) return
    if (pointerId != null && e.pointerId !== pointerId) return
    finish()
  }

  function onPointerCancel() {
    if (flying.value) return
    reset()
  }

  const binders = {
    onPointerdown: onPointerDown,
    onPointermove: onPointerMove,
    onPointerup: onPointerUp,
    onPointercancel: onPointerCancel,
  }

  return {
    x,
    y,
    dragging,
    flying,
    progress,
    skipHint,
    keepHint,
    cardStyle,
    binders,
    reset,
  }
}
