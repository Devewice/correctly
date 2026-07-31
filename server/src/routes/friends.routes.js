import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { env } from '../config/env.js'
import { toDateKeyInTz, nextMidnightInTz } from '../utils/dates.js'
import { saveDailyPhotoFromDataUrl, deleteUploadFile } from '../utils/uploads.js'
import { purgeExpiredShares } from '../services/friendsCleanup.js'
import { XP, addXp } from '../utils/xp.js'

const router = Router()
router.use(requireAuth)

function orderedPair(a, b) {
  return a < b ? [a, b] : [b, a]
}

async function friendIdsOf(userId) {
  const rows = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
  })
  return rows.map((r) => (r.userAId === userId ? r.userBId : r.userAId))
}

async function areFriends(a, b) {
  const [userAId, userBId] = orderedPair(a, b)
  const row = await prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  })
  return Boolean(row)
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    avatar: u.avatar,
  }
}

function mapShare(share, viewerId) {
  const likes = share.reactions.filter((r) => r.type === 'like').length
  const dislikes = share.reactions.filter((r) => r.type === 'dislike').length
  const mine = share.reactions.find((r) => r.userId === viewerId)
  return {
    id: share.id,
    note: share.note,
    photoUrl: share.photoUrl,
    dateKey: share.dateKey,
    createdAt: share.createdAt,
    expiresAt: share.expiresAt,
    user: publicUser(share.user),
    likes,
    dislikes,
    myReaction: mine?.type || null,
  }
}

/** Lista de amigos + mi enlace de invitación */
router.get('/', async (req, res) => {
  await purgeExpiredShares()
  const ids = await friendIdsOf(req.user.id)
  const friends = ids.length
    ? await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, avatar: true },
        orderBy: { name: 'asc' },
      })
    : []

  let invite = await prisma.friendInvite.findFirst({
    where: {
      creatorId: req.user.id,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!invite) {
    invite = await prisma.friendInvite.create({
      data: {
        creatorId: req.user.id,
        code: crypto.randomBytes(6).toString('base64url'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  const base = (env.clientUrl || '').replace(/\/$/, '')
  res.json({
    friends,
    invite: {
      code: invite.code,
      link: `${base}/friends/join?code=${invite.code}`,
      expiresAt: invite.expiresAt,
    },
    stats: {
      likesReceived: req.user.stats?.likesReceived ?? 0,
      dislikesReceived: req.user.stats?.dislikesReceived ?? 0,
    },
  })
})

/** Regenerar enlace */
router.post('/invite', async (req, res) => {
  await prisma.friendInvite.updateMany({
    where: {
      creatorId: req.user.id,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    data: { expiresAt: new Date() },
  })
  const invite = await prisma.friendInvite.create({
    data: {
      creatorId: req.user.id,
      code: crypto.randomBytes(6).toString('base64url'),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })
  const base = (env.clientUrl || '').replace(/\/$/, '')
  res.status(201).json({
    invite: {
      code: invite.code,
      link: `${base}/friends/join?code=${invite.code}`,
      expiresAt: invite.expiresAt,
    },
  })
})

const acceptSchema = z.object({
  code: z.string().min(4).max(32),
})

/** Aceptar invitación (emparejar). El enlace se puede reutilizar. */
router.post('/accept', async (req, res) => {
  const { code } = acceptSchema.parse(req.body)
  const invite = await prisma.friendInvite.findUnique({ where: { code } })
  if (!invite) {
    return res.status(404).json({ error: 'Invite not found' })
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return res.status(410).json({ error: 'Invite expired' })
  }
  if (invite.creatorId === req.user.id) {
    return res.status(400).json({ error: 'Cannot friend yourself' })
  }

  const [userAId, userBId] = orderedPair(invite.creatorId, req.user.id)
  const existing = await prisma.friendship.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
  })

  if (!existing) {
    await prisma.friendship.create({ data: { userAId, userBId } })
  }

  await prisma.friendInvite.update({
    where: { id: invite.id },
    data: { usedAt: new Date(), usedById: req.user.id },
  })

  const friend = await prisma.user.findUnique({
    where: { id: invite.creatorId },
    select: { id: true, name: true, avatar: true },
  })
  res.json({ ok: true, alreadyFriends: Boolean(existing), friend })
})

/** Quitar amigo */
router.delete('/:friendId', async (req, res) => {
  const friendId = req.params.friendId
  const [userAId, userBId] = orderedPair(req.user.id, friendId)
  await prisma.friendship.deleteMany({ where: { userAId, userBId } })
  res.json({ ok: true })
})

/** Feed del día: mi share + shares de amigos */
router.get('/feed', async (req, res) => {
  await purgeExpiredShares()
  const tz = req.user.timezone || 'America/Bogota'
  const dateKey = toDateKeyInTz(tz)
  const ids = await friendIdsOf(req.user.id)
  const userIds = [req.user.id, ...ids]

  const shares = await prisma.dailyShare.findMany({
    where: {
      userId: { in: userIds },
      expiresAt: { gt: new Date() },
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      reactions: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const mine = shares.find((s) => s.userId === req.user.id) || null
  const friends = shares.filter((s) => s.userId !== req.user.id)

  res.json({
    dateKey,
    expiresAtHint: nextMidnightInTz(tz).toISOString(),
    mine: mine ? mapShare(mine, req.user.id) : null,
    feed: friends.map((s) => mapShare(s, req.user.id)),
    canPost: !mine,
  })
})

const shareSchema = z
  .object({
    note: z.string().trim().max(500).optional(),
    imageBase64: z.string().max(3_500_000).optional(),
  })
  .refine((d) => Boolean(d.note?.trim()) || Boolean(d.imageBase64), {
    message: 'Note or photo required',
  })

/** Publicar nota y/o foto del día (una sola vez; no se puede borrar) */
router.post('/share', async (req, res) => {
  await purgeExpiredShares()
  const data = shareSchema.parse(req.body)
  const tz = req.user.timezone || 'America/Bogota'
  const dateKey = toDateKeyInTz(tz)

  const existing = await prisma.dailyShare.findUnique({
    where: { userId_dateKey: { userId: req.user.id, dateKey } },
  })
  if (existing) {
    return res.status(409).json({ error: 'Already shared today' })
  }

  let photoUrl = null
  if (data.imageBase64) {
    photoUrl = saveDailyPhotoFromDataUrl(data.imageBase64, req.user.id)
  }

  try {
    const share = await prisma.dailyShare.create({
      data: {
        userId: req.user.id,
        dateKey,
        note: data.note?.trim() || null,
        photoUrl,
        expiresAt: nextMidnightInTz(tz),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        reactions: true,
      },
    })
    await addXp(prisma, req.user.id, XP.journal)
    res.status(201).json({ share: mapShare(share, req.user.id) })
  } catch (err) {
    deleteUploadFile(photoUrl)
    throw err
  }
})

const reactSchema = z.object({
  type: z.enum(['like', 'dislike']),
})

/** Like / dislike (cambia si ya reaccionaste; cuenta en stats del autor) */
router.post('/share/:shareId/react', async (req, res) => {
  const { type } = reactSchema.parse(req.body)
  const share = await prisma.dailyShare.findUnique({
    where: { id: req.params.shareId },
    include: { reactions: true },
  })
  if (!share || share.expiresAt <= new Date()) {
    return res.status(404).json({ error: 'Share not found' })
  }
  if (share.userId === req.user.id) {
    return res.status(400).json({ error: 'Cannot react to your own share' })
  }
  if (!(await areFriends(req.user.id, share.userId))) {
    return res.status(403).json({ error: 'Not friends' })
  }

  const prev = share.reactions.find((r) => r.userId === req.user.id)

  await prisma.$transaction(async (tx) => {
    await tx.userStats.upsert({
      where: { userId: share.userId },
      create: { userId: share.userId },
      update: {},
    })

    const stats = await tx.userStats.findUnique({ where: { userId: share.userId } })
    let likes = stats.likesReceived
    let dislikes = stats.dislikesReceived

    if (prev) {
      if (prev.type === type) {
        /* mismo voto */
      } else {
        if (prev.type === 'like') likes -= 1
        else dislikes -= 1
        if (type === 'like') likes += 1
        else dislikes += 1
        await tx.dailyShareReaction.update({
          where: { id: prev.id },
          data: { type },
        })
      }
    } else {
      await tx.dailyShareReaction.create({
        data: { shareId: share.id, userId: req.user.id, type },
      })
      if (type === 'like') likes += 1
      else dislikes += 1
    }

    await tx.userStats.update({
      where: { userId: share.userId },
      data: {
        likesReceived: Math.max(0, likes),
        dislikesReceived: Math.max(0, dislikes),
      },
    })
  })

  const fresh = await prisma.dailyShare.findUnique({
    where: { id: share.id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      reactions: true,
    },
  })
  res.json({ share: mapShare(fresh, req.user.id) })
})

export default router
