/** Pitido suave (Web Audio) — sin archivos externos */
export function playSoftChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime

    const tones = [
      { f: 523.25, t: 0, d: 0.18 },
      { f: 659.25, t: 0.16, d: 0.22 },
    ]

    for (const tone of tones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = tone.f
      gain.gain.setValueAtTime(0.0001, now + tone.t)
      gain.gain.exponentialRampToValueAtTime(0.12, now + tone.t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.t + tone.d)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + tone.t)
      osc.stop(now + tone.t + tone.d + 0.02)
    }

    setTimeout(() => ctx.close().catch(() => {}), 800)
  } catch {
    /* silenciosos si el navegador bloquea audio */
  }
}
