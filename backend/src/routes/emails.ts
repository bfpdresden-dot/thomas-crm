import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/emails
router.get('/', async (req: Request, res: Response) => {
  try {
    const { contactId } = req.query
    const emails = await prisma.email.findMany({
      where: contactId ? { contactId: contactId as string } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: { select: { firstName: true, lastName: true, email: true } },
      },
    })
    res.json(emails)
  } catch {
    res.status(500).json({ error: 'Failed to fetch emails' })
  }
})

// GET /api/emails/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const email = await prisma.email.findUnique({
      where: { id: req.params.id },
      include: { contact: true },
    })
    if (!email) return res.status(404).json({ error: 'Email not found' })
    res.json(email)
  } catch {
    res.status(500).json({ error: 'Failed to fetch email' })
  }
})

// POST /api/emails — log a sent email and create activity
router.post('/', async (req: Request, res: Response) => {
  try {
    const { contactId, subject, body, fromAddr, toAddr } = req.body
    if (!contactId || !subject || !body || !toAddr) {
      return res.status(400).json({ error: 'contactId, subject, body, toAddr are required' })
    }
    const email = await prisma.email.create({
      data: {
        contactId,
        subject,
        body,
        fromAddr: fromAddr || process.env.SMTP_FROM || 'noreply@thomas-crm.app',
        toAddr,
        sentAt: new Date(),
      },
    })
    await prisma.activity.create({
      data: {
        contactId,
        type: 'email',
        title: `Email sent: ${subject}`,
        description: `To: ${toAddr}`,
      },
    })
    res.status(201).json(email)
  } catch {
    res.status(500).json({ error: 'Failed to create email' })
  }
})

export default router
