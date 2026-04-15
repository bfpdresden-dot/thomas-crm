import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/activities
router.get('/', async (req: Request, res: Response) => {
  try {
    const { contactId } = req.query
    const activities = await prisma.activity.findMany({
      where: contactId ? { contactId: contactId as string } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { contact: { select: { firstName: true, lastName: true } } },
      take: 100,
    })
    res.json(activities)
  } catch {
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// POST /api/activities
router.post('/', async (req: Request, res: Response) => {
  try {
    const { contactId, type, title, description } = req.body
    if (!type || !title) {
      return res.status(400).json({ error: 'type and title are required' })
    }
    const activity = await prisma.activity.create({
      data: { contactId, type, title, description },
    })
    res.status(201).json(activity)
  } catch {
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

// DELETE /api/activities/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2025') return res.status(404).json({ error: 'Activity not found' })
    res.status(500).json({ error: 'Failed to delete activity' })
  }
})

export default router
