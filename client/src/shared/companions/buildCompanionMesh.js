import * as THREE from 'three'

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.42,
    metalness: opts.metalness ?? 0.06,
    ...opts,
  })
}

function ellipsoid(rx, ry, rz, material) {
  const g = new THREE.SphereGeometry(1, 28, 22)
  g.scale(rx, ry, rz)
  return new THREE.Mesh(g, material)
}

/**
 * Construye una mascota 3D procedural a partir de la apariencia.
 * @param {{ body:string, ears:string, legs:string, tail:string, accent:string, accent2:string }} look
 */
export function buildCompanionMesh(look) {
  const root = new THREE.Group()
  const accent = look.accent || '#7f9f7c'
  const accent2 = look.accent2 || '#4a6648'
  const soft = mat('#fff8f0', { roughness: 0.55, transparent: true, opacity: 0.55 })
  const main = mat(accent)
  const dark = mat(accent2, { roughness: 0.5 })
  const ink = mat('#2c2f2b', { roughness: 0.35 })
  const blush = mat('#e8a090', { roughness: 0.6, transparent: true, opacity: 0.55 })
  const white = mat('#ffffff', { roughness: 0.3 })

  const bodyScale = {
    round: [0.55, 0.5, 0.52],
    oval: [0.48, 0.58, 0.48],
    bean: [0.62, 0.44, 0.5],
    tall: [0.44, 0.64, 0.44],
  }[look.body] || [0.55, 0.5, 0.52]

  const body = ellipsoid(bodyScale[0], bodyScale[1], bodyScale[2], main)
  body.position.y = 0.55
  body.castShadow = true
  body.receiveShadow = true
  root.add(body)

  const belly = ellipsoid(bodyScale[0] * 0.55, bodyScale[1] * 0.42, bodyScale[2] * 0.35, soft)
  belly.position.set(0, 0.42, 0.28)
  root.add(belly)

  // —— Orejas ——
  const ears = new THREE.Group()
  ears.position.y = 0.55 + bodyScale[1] * 0.55
  if (look.ears === 'cat' || look.ears === 'fox') {
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 10), main)
      ear.position.set(side * 0.28, 0.12, 0.05)
      ear.rotation.z = side * 0.35
      ear.castShadow = true
      ears.add(ear)
      if (look.ears === 'fox') {
        const inner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 8), soft)
        inner.position.set(side * 0.28, 0.08, 0.12)
        inner.rotation.z = side * 0.35
        ears.add(inner)
      }
    }
  } else if (look.ears === 'bunny') {
    for (const side of [-1, 1]) {
      const ear = ellipsoid(0.1, 0.38, 0.08, main)
      ear.position.set(side * 0.18, 0.28, -0.02)
      ear.castShadow = true
      ears.add(ear)
      const inner = ellipsoid(0.045, 0.22, 0.04, blush)
      inner.position.set(side * 0.18, 0.28, 0.04)
      ears.add(inner)
    }
  } else if (look.ears === 'dog') {
    for (const side of [-1, 1]) {
      const ear = ellipsoid(0.14, 0.28, 0.08, dark)
      ear.position.set(side * 0.38, -0.02, 0.05)
      ear.rotation.z = side * 0.9
      ear.castShadow = true
      ears.add(ear)
    }
  } else if (look.ears === 'bear') {
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), main)
      ear.position.set(side * 0.32, 0.08, 0)
      ear.castShadow = true
      ears.add(ear)
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), dark)
      inner.position.set(side * 0.32, 0.08, 0.06)
      ears.add(inner)
    }
  } else if (look.ears === 'chick') {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 8), dark)
    crest.position.set(0, 0.18, 0.05)
    ears.add(crest)
  } else if (look.ears === 'horn') {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 8), dark)
    horn.position.set(0, 0.22, 0.02)
    ears.add(horn)
  }
  root.add(ears)

  // —— Cara ——
  const face = new THREE.Group()
  face.position.set(0, 0.58, bodyScale[2] * 0.78)
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), ink)
  const eyeR = eyeL.clone()
  eyeL.position.set(-0.16, 0.04, 0)
  eyeR.position.set(0.16, 0.04, 0)
  const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), white)
  const shineR = shineL.clone()
  shineL.position.set(-0.14, 0.07, 0.05)
  shineR.position.set(0.18, 0.07, 0.05)
  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), blush)
  const cheekR = cheekL.clone()
  cheekL.position.set(-0.28, -0.06, 0.02)
  cheekR.position.set(0.28, -0.06, 0.02)
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.012, 8, 16, Math.PI),
    ink,
  )
  mouth.rotation.x = Math.PI
  mouth.position.set(0, -0.08, 0.02)
  face.add(eyeL, eyeR, shineL, shineR, cheekL, cheekR, mouth)
  root.add(face)

  // —— Cola ——
  const tail = new THREE.Group()
  if (look.tail === 'cat') {
    const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.45, 6, 10), dark)
    t.position.set(0.42, 0.5, -0.25)
    t.rotation.z = -0.8
    t.rotation.x = 0.4
    t.castShadow = true
    tail.add(t)
  } else if (look.tail === 'dog') {
    const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.28, 6, 10), dark)
    t.position.set(0.35, 0.7, -0.2)
    t.rotation.z = -0.4
    t.castShadow = true
    tail.add(t)
  } else if (look.tail === 'fluff') {
    const t = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), dark)
    t.position.set(0.4, 0.45, -0.28)
    t.castShadow = true
    tail.add(t)
  } else if (look.tail === 'bird') {
    for (const side of [-1, 1]) {
      const wing = ellipsoid(0.22, 0.12, 0.06, dark)
      wing.position.set(side * 0.48, 0.55, 0)
      wing.rotation.z = side * 0.3
      wing.castShadow = true
      tail.add(wing)
    }
  } else if (look.tail === 'leaf') {
    const leaf = ellipsoid(0.18, 0.1, 0.05, dark)
    leaf.position.set(0, 1.05, 0)
    leaf.rotation.z = 0.4
    tail.add(leaf)
  }
  root.add(tail)

  // —— Patas ——
  const legs = new THREE.Group()
  const legLen = look.legs === 'hop' ? 0.28 : look.legs === 'stub' || look.legs === 'short' ? 0.18 : 0.32
  const legL = new THREE.Group()
  const legR = new THREE.Group()
  for (const [g, x] of [
    [legL, -0.18],
    [legR, 0.18],
  ]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, legLen, 6, 10), dark)
    thigh.position.y = -legLen * 0.35
    thigh.castShadow = true
    const foot = ellipsoid(0.11, 0.05, 0.13, dark)
    foot.position.set(0, -legLen * 0.75, 0.04)
    foot.castShadow = true
    g.add(thigh, foot)
    g.position.set(x, 0.22, 0.05)
    legs.add(g)
  }
  root.add(legs)

  // Sombra blanda
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 24),
    new THREE.MeshBasicMaterial({ color: '#1a1d19', transparent: true, opacity: 0.18 }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.01
  root.add(shadow)

  root.userData = {
    body,
    face,
    eyeL,
    eyeR,
    mouth,
    legL,
    legR,
    ears,
    tail,
    legsMode: look.legs || 'walk',
  }

  return root
}

/**
 * Aplica pose/animación por estado y tiempo.
 * @param {THREE.Group} root
 * @param {string} mood
 * @param {number} t seconds
 */
export function animateCompanionMesh(root, mood, t) {
  const u = root.userData
  if (!u?.body) return

  const bob = Math.sin(t * 2.2) * 0.03
  let y = 0
  let rotZ = 0
  let scale = 1

  if (mood === 'happy' || mood === 'great') {
    y = Math.abs(Math.sin(t * 6)) * 0.12
    scale = 1 + Math.sin(t * 6) * 0.03
  } else if (mood === 'strong' || mood === 'proud') {
    scale = 1 + Math.sin(t * 3) * 0.05
  } else if (mood === 'wave') {
    rotZ = Math.sin(t * 8) * 0.18
  } else if (mood === 'sleepy') {
    y = Math.sin(t * 1.2) * 0.02
    u.face.rotation.x = 0.2
  } else if (mood === 'low' || mood === 'destroyed') {
    y = -0.04
    scale = 0.94
    u.face.rotation.x = 0.15
  } else if (mood === 'sick') {
    rotZ = Math.sin(t * 2) * 0.08
    y = -0.02
  } else if (mood === 'hungry') {
    rotZ = Math.sin(t * 10) * 0.04
  } else {
    y = bob
    u.face.rotation.x = 0
  }

  root.position.y = y
  root.rotation.z = rotZ
  root.scale.setScalar(scale)

  // Piernas
  const swing =
    u.legsMode === 'walk'
      ? Math.sin(t * (mood === 'happy' || mood === 'great' ? 8 : 5)) * 0.45
      : u.legsMode === 'hop'
        ? Math.abs(Math.sin(t * 6)) * 0.25
        : Math.sin(t * 2) * 0.08
  u.legL.rotation.x = swing
  u.legR.rotation.x = -swing

  // Cola
  if (u.tail) u.tail.rotation.y = Math.sin(t * 2.5) * 0.35

  // Parpadeo ocasional
  const blink = Math.sin(t * 0.7) > 0.96
  const eyeSy = mood === 'sleepy' ? 0.35 : blink ? 0.12 : 1
  u.eyeL.scale.y = eyeSy
  u.eyeR.scale.y = eyeSy
}
