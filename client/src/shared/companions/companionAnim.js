/** Animaciones con fundido suave entre estados. */

function smoothstep(x) {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Pose objetivo según mood (valores relativos).
 * @returns {{ y:number, rotX:number, rotZ:number, scale:number, faceX:number, legAmp:number, legSpeed:number, eyeSy:number, bob:number }}
 */
export function poseForMood(mood, t, legsMode = 'walk') {
  const baseBob = Math.sin(t * 2.1) * 0.025
  const pose = {
    y: baseBob,
    rotX: 0,
    rotZ: 0,
    scale: 1,
    faceX: 0,
    legAmp: legsMode === 'walk' ? 0.4 : legsMode === 'hop' ? 0.28 : 0.1,
    legSpeed: 4.2,
    eyeSy: 1,
    bob: 1,
  }

  switch (mood) {
    case 'happy':
      pose.y = Math.abs(Math.sin(t * 5.2)) * 0.1 + baseBob * 0.3
      pose.scale = 1 + Math.sin(t * 5.2) * 0.025
      pose.legAmp = 0.55
      pose.legSpeed = 7.2
      break
    case 'great':
      pose.y = Math.abs(Math.sin(t * 5.8)) * 0.14
      pose.scale = 1.04 + Math.sin(t * 5.8) * 0.03
      pose.legAmp = 0.6
      pose.legSpeed = 8
      pose.rotZ = Math.sin(t * 3) * 0.06
      break
    case 'strong':
      pose.scale = 1.06 + Math.sin(t * 2.8) * 0.04
      pose.y = baseBob * 0.5
      pose.legAmp = 0.35
      pose.chest = 0.04
      break
    case 'proud':
      pose.scale = 1.05 + Math.sin(t * 2.2) * 0.03
      pose.rotX = -0.08
      pose.y = 0.02 + baseBob * 0.4
      break
    case 'wave':
      pose.rotZ = Math.sin(t * 7.5) * 0.22
      pose.y = baseBob + 0.02
      pose.legAmp = 0.15
      break
    case 'sleepy':
      pose.y = Math.sin(t * 1.1) * 0.015
      pose.faceX = 0.22
      pose.rotX = 0.12
      pose.eyeSy = 0.32
      pose.legAmp = 0.04
      pose.legSpeed = 1.2
      pose.scale = 0.98
      break
    case 'low':
      pose.y = -0.03 + baseBob * 0.3
      pose.scale = 0.95
      pose.faceX = 0.12
      pose.rotX = 0.1
      pose.legAmp = 0.12
      pose.legSpeed = 2.4
      break
    case 'destroyed':
      pose.y = -0.05
      pose.scale = 0.92
      pose.faceX = 0.18
      pose.rotX = 0.16
      pose.eyeSy = 0.55
      pose.legAmp = 0.05
      pose.legSpeed = 1.5
      break
    case 'sick':
      pose.rotZ = Math.sin(t * 1.8) * 0.1
      pose.y = -0.02 + Math.sin(t * 1.8) * 0.01
      pose.scale = 0.96
      pose.faceX = 0.1
      pose.legAmp = 0.08
      break
    case 'hungry':
      pose.rotZ = Math.sin(t * 9) * 0.05
      pose.y = baseBob
      pose.scale = 1 + Math.sin(t * 9) * 0.015
      pose.legAmp = 0.25
      break
    case 'thirsty':
      pose.y = baseBob * 1.2
      pose.rotX = Math.sin(t * 2) * 0.04
      pose.legAmp = 0.2
      break
    case 'ok':
      pose.y = baseBob * 0.8
      pose.legAmp = 0.22
      pose.legSpeed = 3.2
      break
    case 'idle':
    default:
      break
  }

  // Modo de patas por especie
  if (legsMode === 'flipper' || legsMode === 'none') {
    pose.legAmp *= 0.35
  } else if (legsMode === 'hop') {
    pose.legSpeed = Math.max(pose.legSpeed, 5.5)
  } else if (legsMode === 'stubby' || legsMode === 'short' || legsMode === 'stick') {
    pose.legAmp *= 0.55
  }

  return pose
}

/**
 * Inicializa estado de blend en userData del mesh.
 */
export function initAnimState(userData) {
  userData.anim = {
    mood: 'idle',
    prevMood: 'idle',
    blend: 1,
  }
}

/**
 * Aplica animación con transición suave.
 * @param {import('three').Group} root
 * @param {string} mood
 * @param {number} t
 * @param {number} dt
 */
export function animateCompanionMesh(root, mood, t, dt = 1 / 60) {
  const u = root.userData
  if (!u?.body) return
  if (!u.anim) initAnimState(u)

  if (u.anim.mood !== mood) {
    u.anim.prevMood = u.anim.mood
    u.anim.mood = mood
    u.anim.blend = 0
  }

  // ~0.4s de fundido
  u.anim.blend = Math.min(1, u.anim.blend + dt / 0.42)
  const e = smoothstep(u.anim.blend)

  const legsMode = u.legsMode || 'walk'
  const a = poseForMood(u.anim.prevMood, t, legsMode)
  const b = poseForMood(u.anim.mood, t, legsMode)

  const y = lerp(a.y, b.y, e)
  const rotX = lerp(a.rotX, b.rotX, e)
  const rotZ = lerp(a.rotZ, b.rotZ, e)
  const scale = lerp(a.scale, b.scale, e)
  const faceX = lerp(a.faceX, b.faceX, e)
  const legAmp = lerp(a.legAmp, b.legAmp, e)
  const legSpeed = lerp(a.legSpeed, b.legSpeed, e)
  let eyeSy = lerp(a.eyeSy, b.eyeSy, e)

  // Parpadeo suave (no en sleepy profundo)
  const blinkWave = Math.sin(t * 0.65)
  if (eyeSy > 0.5 && blinkWave > 0.97) {
    eyeSy = lerp(eyeSy, 0.12, 0.85)
  }

  root.position.y = y
  root.rotation.x = rotX
  root.rotation.z = rotZ
  // Idle yaw suave
  root.rotation.y = Math.sin(t * 0.55) * 0.22
  root.scale.setScalar(scale)

  if (u.face) u.face.rotation.x = faceX

  const swing = Math.sin(t * legSpeed) * legAmp
  if (u.legL) u.legL.rotation.x = swing
  if (u.legR) u.legR.rotation.x = -swing
  // Flippers / hop: también un poco en Z
  if (legsMode === 'flipper' || legsMode === 'hop') {
    if (u.legL) u.legL.rotation.z = swing * 0.35
    if (u.legR) u.legR.rotation.z = -swing * 0.35
  }

  if (u.tail) {
    const wag =
      u.anim.mood === 'happy' || u.anim.mood === 'great' || u.anim.mood === 'wave'
        ? Math.sin(t * 6) * 0.55
        : Math.sin(t * 2.2) * 0.28
    u.tail.rotation.y = wag
    u.tail.rotation.z = Math.sin(t * 1.8) * 0.12
  }

  if (u.wings) {
    const flap =
      u.anim.mood === 'happy' || u.anim.mood === 'great'
        ? Math.sin(t * 8) * 0.45
        : Math.sin(t * 2.5) * 0.15
    u.wings.children.forEach((w, i) => {
      w.rotation.z = (i === 0 ? -1 : 1) * (0.35 + flap)
    })
  }

  if (u.eyeL) u.eyeL.scale.y = eyeSy
  if (u.eyeR) u.eyeR.scale.y = eyeSy
}
