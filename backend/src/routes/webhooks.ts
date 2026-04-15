import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/webhooks/logs — list webhook logs (must be before /:source)
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { source } = req.query
    const logs = await prisma.webhookLog.findMany({
      where: source ? { source: source as string } : undefined,
      orderBy: { receivedAt: 'desc' },
      take: 100,
    })
    res.json(logs)
  } catch {
    res.status(500).json({ error: 'Failed to fetch webhook logs' })
  }
})

// PATCH /api/webhooks/logs/:id/processed
router.patch('/logs/:id/processed', async (req: Request, res: Response) => {
  try {
    const log = await prisma.webhookLog.update({
      where: { id: req.params.id },
      data: { processed: true },
    })
    res.json(log)
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2025') return res.status(404).json({ error: 'Log not found' })
    res.status(500).json({ error: 'Failed to update log' })
  }
})

// POST /api/webhooks/:source — receive a webhook from any source
router.post('/:source', async (req: Request, res: Response) => {
  try {
    const { source } = req.params
    const event =
      (req.headers['x-event-type'] as string) ||
      (req.body as { event?: string }).event ||
      'unknown'
    const log = await prisma.webhookLog.create({
      data: {
        source,
        event,
        payload: req.body as object,
        processed: false,
      },
    })
    res.status(200).json({ received: true, id: log.id })
  } catch {
    res.status(500).json({ error: 'Failed to log webhook' })
  }
})

export default router
