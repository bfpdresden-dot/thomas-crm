import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/contacts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query
    const contacts = await prisma.contact.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } },
              { email: { contains: search as string, mode: 'insensitive' } },
              { company: { contains: search as string, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { emails: true, activities: true } } },
    })
    res.json(contacts)
  } catch {
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

// GET /api/contacts/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: {
        emails: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!contact) return res.status(404).json({ error: 'Contact not found' })
    res.json(contact)
  } catch {
    res.status(500).json({ error: 'Failed to fetch contact' })
  }
})

// POST /api/contacts
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, company, notes } = req.body
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName, and email are required' })
    }
    const contact = await prisma.contact.create({
      data: { firstName, lastName, email, phone, company, notes },
    })
    res.status(201).json(contact)
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2002') return res.status(409).json({ error: 'Email already exists' })
    res.status(500).json({ error: 'Failed to create contact' })
  }
})

// PATCH /api/contacts/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, company, notes } = req.body
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { firstName, lastName, email, phone, company, notes },
    })
    res.json(contact)
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2025') return res.status(404).json({ error: 'Contact not found' })
    res.status(500).json({ error: 'Failed to update contact' })
  }
})

// DELETE /api/contacts/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2025') return res.status(404).json({ error: 'Contact not found' })
    res.status(500).json({ error: 'Failed to delete contact' })
  }
})

export default router
