/** Presets calmados para @vueuse/motion */

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
}

export const fadeIn = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 600 } },
}

export const popIn = {
  initial: { opacity: 0, scale: 0.92 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 16 },
  },
}

export const softHover = {
  hovered: { scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  tapped: { scale: 0.97 },
}

export const moodHover = {
  hovered: { scale: 1.12, y: -4, transition: { type: 'spring', stiffness: 320, damping: 16 } },
  tapped: { scale: 0.94 },
}

export function withDelay(preset, delayMs) {
  return {
    ...preset,
    enter: {
      ...preset.enter,
      transition: {
        ...(preset.enter?.transition || {}),
        delay: delayMs,
      },
    },
  }
}
