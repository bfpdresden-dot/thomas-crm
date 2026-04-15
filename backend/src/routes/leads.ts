import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

const VALID_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost']

// POST /api/leads — n8n schickt einen neuen Lead
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, company, notes, source } = req.body
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName und email sind Pflichtfelder' })
    }
    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        notes,
        source: source || 'manual',
        status: 'new',
      },
    })
    await prisma.activity.create({
      data: {
        contactId: contact.id,
        type: 'lead',
        title: `Neuer Lead`,
        description: `Quelle: ${source || 'manuell'}`,
      },
    })
    res.status(201).json(contact)
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2002') return res.status(409).json({ error: 'E-Mail bereits vorhanden' })
    res.status(500).json({ error: 'Lead konnte nicht gespeichert werden' })
  }
})

// GET /api/leads — alle Leads gruppiert nach Status (für Pipeline)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { emails: true, activities: true } } },
    })
    res.json(contacts)
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Leads' })
  }
})

// PATCH /api/leads/:id/status — Status in der Pipeline ändern
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Ungültiger Status. Erlaubt: ${VALID_STATUSES.join(', ')}` })
    }
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { status },
    })
    await prisma.activity.create({
      data: {
        contactId: contact.id,
        type: 'status',
        title: `Status geändert zu: ${status}`,
      },
    })
    res.json(contact)
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2025') return res.status(404).json({ error: 'Kontakt nicht gefunden' })
    res.status(500).json({ error: 'Status konnte nicht aktualisiert werden' })
  }
})

export default router
