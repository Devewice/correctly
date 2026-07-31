import * as THREE from 'three'
import { resolveRecipe } from '@/shared/companions/speciesRecipes'
import { animateCompanionMesh, initAnimState } from '@/shared/companions/companionAnim'

export { animateCompanionMesh }

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.44,
    metalness: opts.metalness ?? 0.05,
    ...opts,
  })
}

function ellipsoid(rx, ry, rz, material) {
  const g = new THREE.SphereGeometry(1, 32, 24)
  g.scale(rx, ry, rz)
  const m = new THREE.Mesh(g, material)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function addCast(mesh) {
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/**
 * @param {{ species?: string, variant?: string, accent: string, accent2: string, body?: string, ears?: string, legs?: string, tail?: string }} look
 */
export function buildCompanionMesh(look) {
  const recipe = resolveRecipe(look.species || 'critter', look.variant)
  // Overrides de personalización (si el usuario mezcló partes)
  if (look.ears && look.ears !== 'none') {
    const map = { cat: 'cat', dog: 'dog', bunny: 'bunny', fox: 'fox', bear: 'bear', horn: 'horn', chick: 'crest' }
    if (map[look.ears]) recipe.ear = map[look.ears]
  }
  if (look.legs) {
    const map = { walk: 'walk', hop: 'hop', stub: 'stubby', short: 'short' }
    if (map[look.legs]) recipe.legs = map[look.legs]
  }

  const accent = recipe.accentForce || look.accent || '#7f9f7c'
  const accent2 = recipe.accent2Force || look.accent2 || '#4a6648'

  const root = new THREE.Group()
  const main = mat(accent)
  const dark = mat(accent2, { roughness: 0.5 })
  const soft = mat('#fff6ee', { roughness: 0.55 })
  const ink = mat('#2c2f2b', { roughness: 0.35 })
  const blush = mat('#e8a090', { roughness: 0.65, transparent: true, opacity: 0.5 })
  const white = mat('#ffffff', { roughness: 0.28 })
  const patch = mat(accent2, { roughness: 0.48 })

  const [bx, by, bz] = recipe.body
  const body = ellipsoid(bx, by, bz, recipe.fluffy ? soft : main)
  body.position.y = 0.52
  root.add(body)

  if (recipe.tuxedo) {
    const belly = ellipsoid(bx * 0.55, by * 0.7, bz * 0.35, soft)
    belly.position.set(0, 0.5, bz * 0.55)
    root.add(belly)
  } else {
    const belly = ellipsoid(bx * 0.55, by * 0.45, bz * 0.35, soft)
    belly.position.set(0, 0.4, bz * 0.55)
    root.add(belly)
  }

  if (recipe.patches) {
    const p1 = ellipsoid(0.14, 0.12, 0.1, patch)
    p1.position.set(-0.25, 0.6, bz * 0.7)
    const p2 = ellipsoid(0.12, 0.1, 0.08, patch)
    p2.position.set(0.22, 0.45, bz * 0.65)
    root.add(p1, p2)
  }

  if (recipe.stripes) {
    for (let i = 0; i < 3; i++) {
      const s = ellipsoid(0.06, by * 0.7, bz * 0.85, dark)
      s.position.set(-0.18 + i * 0.18, 0.52, 0)
      root.add(s)
    }
  }

  // —— Cabeza ——
  const [hx, hy, hz] = recipe.head
  const head = new THREE.Group()
  head.position.y = recipe.headY
  const headMesh = ellipsoid(hx, hy, hz, main)
  head.add(headMesh)

  // Orejas según recipe
  const ears = new THREE.Group()
  ears.position.y = hy * 0.55
  buildEars(ears, recipe.ear, main, dark, soft, blush)
  head.add(ears)

  // Hocico / pico / trompa
  const snoutGroup = new THREE.Group()
  snoutGroup.position.set(0, -hy * 0.15, hz * 0.85)
  buildSnout(snoutGroup, recipe.snout, main, dark, soft, ink)
  head.add(snoutGroup)

  if (recipe.trunk) {
    const trunk = addCast(new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.45, 6, 10), main))
    trunk.position.set(0, -0.15, hz * 0.9)
    trunk.rotation.x = 0.6
    head.add(trunk)
  }

  if (recipe.mane) {
    const mane = ellipsoid(hx * 1.45, hy * 1.35, hz * 1.1, dark)
    mane.position.z = -0.05
    head.add(mane)
  }

  if (recipe.antlers) {
    for (const side of [-1, 1]) {
      const a = addCast(new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.28, 4, 6), dark))
      a.position.set(side * 0.12, hy * 0.9, 0)
      a.rotation.z = side * 0.35
      head.add(a)
    }
  }

  if (recipe.gills) {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const g = ellipsoid(0.08, 0.03, 0.02, blush)
        g.position.set(side * (hx * 0.95), 0.05 - i * 0.08, 0)
        head.add(g)
      }
    }
  }

  if (recipe.mask) {
    const m = ellipsoid(hx * 0.85, hy * 0.35, hz * 0.5, dark)
    m.position.set(0, 0.05, hz * 0.55)
    head.add(m)
  }

  // Ojos
  const face = new THREE.Group()
  const gap = recipe.eyeGap || 0.14
  const eyeY = recipe.eyeY ?? 0.04
  const eyeL = addCast(new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), ink))
  const eyeR = eyeL.clone()
  eyeL.position.set(-gap, eyeY, hz * 0.75)
  eyeR.position.set(gap, eyeY, hz * 0.75)
  const shineL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), white)
  const shineR = shineL.clone()
  shineL.position.set(-gap + 0.02, eyeY + 0.025, hz * 0.88)
  shineR.position.set(gap + 0.02, eyeY + 0.025, hz * 0.88)
  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), blush)
  const cheekR = cheekL.clone()
  cheekL.position.set(-gap * 1.7, -0.08, hz * 0.7)
  cheekR.position.set(gap * 1.7, -0.08, hz * 0.7)
  face.add(eyeL, eyeR, shineL, shineR, cheekL, cheekR)
  head.add(face)
  root.add(head)

  // —— Cola / alas ——
  const tail = new THREE.Group()
  const wings = new THREE.Group()
  buildTail(tail, wings, recipe, main, dark, soft)
  root.add(tail)
  if (wings.children.length) root.add(wings)

  if (recipe.plates) {
    for (let i = 0; i < 3; i++) {
      const plate = addCast(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 5), dark))
      plate.position.set(0, 0.7 + i * 0.12, -bz * 0.3)
      plate.rotation.x = -0.5
      root.add(plate)
    }
  }

  if (recipe.spikes) {
    for (let i = 0; i < 5; i++) {
      const sp = addCast(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 5), dark))
      const ang = (i / 5) * Math.PI * 2
      sp.position.set(Math.cos(ang) * bx * 0.7, 0.7, Math.sin(ang) * bz * 0.7)
      root.add(sp)
    }
  }

  // —— Patas ——
  const { legL, legR, legsMode } = buildLegs(recipe.legs, dark, bx)
  root.add(legL, legR)

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 28),
    new THREE.MeshBasicMaterial({ color: '#1a1d19', transparent: true, opacity: 0.16 }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.01
  root.add(shadow)

  root.userData = {
    body,
    head,
    face,
    eyeL,
    eyeR,
    legL,
    legR,
    ears,
    tail,
    wings: wings.children.length ? wings : null,
    legsMode,
    species: look.species,
    variant: look.variant,
  }
  initAnimState(root.userData)

  return root
}

function buildEars(ears, style, main, dark, soft, blush) {
  if (style === 'none') return
  if (style === 'cat' || style === 'fox') {
    for (const side of [-1, 1]) {
      const ear = addCast(new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 10), main))
      ear.position.set(side * 0.22, 0.12, 0)
      ear.rotation.z = side * 0.4
      ears.add(ear)
      if (style === 'fox') {
        const inner = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), soft)
        inner.position.set(side * 0.22, 0.08, 0.06)
        inner.rotation.z = side * 0.4
        ears.add(inner)
      }
    }
  } else if (style === 'bunny') {
    for (const side of [-1, 1]) {
      const ear = ellipsoid(0.09, 0.42, 0.07, main)
      ear.position.set(side * 0.14, 0.32, -0.02)
      ears.add(ear)
      const inner = ellipsoid(0.04, 0.24, 0.035, blush)
      inner.position.set(side * 0.14, 0.3, 0.03)
      ears.add(inner)
    }
  } else if (style === 'dog' || style === 'farm') {
    for (const side of [-1, 1]) {
      const ear = ellipsoid(0.12, 0.26, 0.07, dark)
      ear.position.set(side * 0.3, -0.02, 0.04)
      ear.rotation.z = side * 0.95
      ears.add(ear)
    }
  } else if (style === 'bear' || style === 'round' || style === 'fluff') {
    for (const side of [-1, 1]) {
      const ear = addCast(new THREE.Mesh(new THREE.SphereGeometry(style === 'fluff' ? 0.18 : 0.15, 16, 12), main))
      ear.position.set(side * 0.28, 0.1, 0)
      ears.add(ear)
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), dark)
      inner.position.set(side * 0.28, 0.1, 0.06)
      ears.add(inner)
    }
  } else if (style === 'elephant') {
    for (const side of [-1, 1]) {
      const ear = ellipsoid(0.22, 0.28, 0.06, main)
      ear.position.set(side * 0.38, 0, 0)
      ears.add(ear)
    }
  } else if (style === 'wild') {
    for (const side of [-1, 1]) {
      const ear = addCast(new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 10), main))
      ear.position.set(side * 0.2, 0.14, 0)
      ear.rotation.z = side * 0.25
      ears.add(ear)
    }
  } else if (style === 'horn' || style === 'crest' || style === 'tuft') {
    if (style === 'horn') {
      const horn = addCast(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.36, 8), dark))
      horn.position.set(0, 0.28, 0)
      ears.add(horn)
    } else if (style === 'crest') {
      const c = addCast(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 8), dark))
      c.position.set(0, 0.2, 0.04)
      ears.add(c)
    } else {
      for (const side of [-1, 1]) {
        const t = ellipsoid(0.06, 0.12, 0.05, dark)
        t.position.set(side * 0.16, 0.18, 0)
        ears.add(t)
      }
    }
  } else if (style === 'leaf') {
    const leaf = ellipsoid(0.16, 0.1, 0.04, dark)
    leaf.position.set(0, 0.2, 0)
    leaf.rotation.z = 0.4
    ears.add(leaf)
  }
}

function buildSnout(g, style, main, dark, soft, ink) {
  if (!style || style === 'none') return
  if (style === 'beak') {
    const beak = addCast(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 8), dark))
    beak.rotation.x = Math.PI / 2
    beak.position.z = 0.08
    g.add(beak)
    return
  }
  if (style === 'disk') {
    const disk = addCast(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), soft))
    disk.rotation.x = Math.PI / 2
    disk.position.z = 0.06
    g.add(disk)
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), ink)
    nostril.position.set(-0.04, 0, 0.12)
    g.add(nostril, nostril.clone().translateX(0.08))
    return
  }
  const sizes = {
    tiny: [0.1, 0.08, 0.1],
    small: [0.12, 0.1, 0.14],
    round: [0.14, 0.12, 0.14],
    long: [0.12, 0.1, 0.22],
    point: [0.1, 0.09, 0.2],
    wide: [0.18, 0.1, 0.12],
    blunt: [0.14, 0.12, 0.16],
    flat: [0.14, 0.1, 0.1],
  }
  const [sx, sy, sz] = sizes[style] || sizes.small
  const snout = ellipsoid(sx, sy, sz, soft)
  snout.position.z = sz * 0.35
  g.add(snout)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), ink)
  nose.position.set(0, sy * 0.2, sz * 0.95)
  g.add(nose)
}

function buildTail(tail, wings, recipe, main, dark, soft) {
  const style = recipe.tail
  if (style === 'none') return
  if (style === 'wings' || recipe.wings) {
    for (const side of [-1, 1]) {
      const w = ellipsoid(0.28, 0.14, 0.06, dark)
      w.position.set(side * 0.45, 0.55, -0.05)
      w.rotation.z = side * 0.35
      wings.add(w)
    }
  }
  if (style === 'long' || style === 'wag') {
    const t = addCast(new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.5, 6, 10), dark))
    t.position.set(0.4, 0.48, -0.28)
    t.rotation.z = -0.85
    t.rotation.x = 0.35
    tail.add(t)
  } else if (style === 'bush' || style === 'puff' || style === 'fancy') {
    const t = ellipsoid(0.2, 0.28, 0.18, style === 'fancy' ? soft : dark)
    t.position.set(0.38, 0.48, -0.3)
    tail.add(t)
  } else if (style === 'fin' || style === 'thick') {
    const t = ellipsoid(0.08, 0.18, 0.22, dark)
    t.position.set(0, 0.45, -0.45)
    tail.add(t)
  } else if (style === 'curl') {
    const t = addCast(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 16, Math.PI), dark))
    t.position.set(0.3, 0.5, -0.2)
    tail.add(t)
  } else if (style === 'thin' || style === 'ring') {
    const t = addCast(new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.35, 4, 8), dark))
    t.position.set(0.32, 0.45, -0.25)
    t.rotation.z = -0.7
    tail.add(t)
    if (style === 'ring') {
      for (let i = 0; i < 3; i++) {
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 6, 12), main)
        r.position.set(0.32 - i * 0.04, 0.5 + i * 0.05, -0.28 - i * 0.06)
        tail.add(r)
      }
    }
  } else if (style === 'leaf') {
    const leaf = ellipsoid(0.16, 0.08, 0.04, dark)
    leaf.position.set(0, 1.15, 0)
    tail.add(leaf)
  }
}

function buildLegs(style, dark, bx) {
  const legL = new THREE.Group()
  const legR = new THREE.Group()
  if (style === 'none') {
    legL.position.set(-0.15, 0.15, 0)
    legR.position.set(0.15, 0.15, 0)
    return { legL, legR, legsMode: 'none' }
  }

  let len = 0.3
  let thick = 0.065
  if (style === 'stubby' || style === 'short') {
    len = 0.16
    thick = 0.08
  } else if (style === 'hop') {
    len = 0.26
    thick = 0.07
  } else if (style === 'stick') {
    len = 0.28
    thick = 0.035
  } else if (style === 'flipper') {
    len = 0.12
    thick = 0.09
  }

  for (const [g, x] of [
    [legL, -bx * 0.35],
    [legR, bx * 0.35],
  ]) {
    if (style === 'flipper') {
      const flip = ellipsoid(0.14, 0.05, 0.2, dark)
      flip.position.set(0, -0.05, 0.08)
      g.add(flip)
    } else {
      const thigh = addCast(new THREE.Mesh(new THREE.CapsuleGeometry(thick, len, 6, 10), dark))
      thigh.position.y = -len * 0.3
      const foot = ellipsoid(thick * 1.5, 0.045, thick * 1.8, dark)
      foot.position.set(0, -len * 0.7, 0.05)
      g.add(thigh, foot)
    }
    g.position.set(x, 0.2, 0.04)
  }

  return { legL, legR, legsMode: style || 'walk' }
}
