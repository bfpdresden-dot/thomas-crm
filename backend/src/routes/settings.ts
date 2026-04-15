import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ── Sources ────────────────────────────────────────────

router.get('/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await prisma.source.findMany({ orderBy: { createdAt: 'asc' } })
    res.json(sources)
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Quellen' })
  }
})

router.post('/sources', async (req: Request, res: Response) => {
  try {
    const { name, label } = req.body
    if (!name || !label) return res.status(400).json({ error: 'name und label sind Pflichtfelder' })
    const source = await prisma.source.create({ data: { name, label } })
    res.status(201).json(source)
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2002') return res.status(409).json({ error: 'Quelle existiert bereits' })
    res.status(500).json({ error: 'Fehler beim Erstellen der Quelle' })
  }
})

router.delete('/sources/:id', async (req: Request, res: Response) => {
  try {
    await prisma.source.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2025') return res.status(404).json({ error: 'Quelle nicht gefunden' })
    res.status(500).json({ error: 'Fehler beim Löschen der Quelle' })
  }
})

// ── Pipeline Stages ────────────────────────────────────

const DEFAULT_STAGES = [
  { key: 'new',       label: 'Neu',          order: 1, showInPipeline: true,  isWon: false, isLost: false },
  { key: 'contacted', label: 'Kontaktiert',  order: 2, showInPipeline: true,  isWon: false, isLost: false },
  { key: 'qualified', label: 'Qualifiziert', order: 3, showInPipeline: true,  isWon: false, isLost: false },
  { key: 'won',       label: 'Gewonnen',     order: 4, showInPipeline: false, isWon: true,  isLost: false },
  { key: 'lost',      label: 'Verloren',     order: 5, showInPipeline: false, isWon: false, isLost: true  },
]

// GET /api/settings/stages — auto-seed defaults if empty
router.get('/stages', async (_req: Request, res: Response) => {
  try {
    let stages = await prisma.pipelineStage.findMany({ orderBy: { order: 'asc' } })
    if (stages.length === 0) {
      await prisma.pipelineStage.createMany({ data: DEFAULT_STAGES })
      stages = await prisma.pipelineStage.findMany({ orderBy: { order: 'asc' } })
    }
    res.json(stages)
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Stufen' })
  }
})

// POST /api/settings/stages
router.post('/stages', async (req: Request, res: Response) => {
  try {
    const { key, label, order } = req.body
    if (!key || !label) return res.status(400).json({ error: 'key und label sind Pflichtfelder' })
    const maxOrder = await prisma.pipelineStage.aggregate({ _max: { order: true } })
    const stage = await prisma.pipelineStage.create({
      data: { key, label, order: order ?? (maxOrder._max.order ?? 3) + 1 },
    })
    res.status(201).json(stage)
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2002') return res.status(409).json({ error: 'Stufe existiert bereits' })
    res.status(500).json({ error: 'Fehler beim Erstellen der Stufe' })
  }
})

// PATCH /api/settings/stages/:id
router.patch('/stages/:id', async (req: Request, res: Response) => {
  try {
    const { label, order } = req.body
    const stage = await prisma.pipelineStage.update({
      where: { id: req.params.id },
      data: { label, order },
    })
    res.json(stage)
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2025') return res.status(404).json({ error: 'Stufe nicht gefunden' })
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Stufe' })
  }
})

// DELETE /api/settings/stages/:id
router.delete('/stages/:id', async (req: Request, res: Response) => {
  try {
    const stage = await prisma.pipelineStage.findUnique({ where: { id: req.params.id } })
    if (stage?.isWon || stage?.isLost) {
      return res.status(400).json({ error: 'Gewonnen und Verloren können nicht gelöscht werden' })
    }
    await prisma.pipelineStage.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2025') return res.status(404).json({ error: 'Stufe nicht gefunden' })
    res.status(500).json({ error: 'Fehler beim Löschen der Stufe' })
  }
})

export default router
