import { useEffect, useState } from 'react'
import { api, Source, PipelineStage } from '../api/client'

export default function Settings() {
  const [sources, setSources] = useState<Source[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loadingSources, setLoadingSources] = useState(true)
  const [loadingStages, setLoadingStages] = useState(true)

  const [sourceForm, setSourceForm] = useState({ name: '', label: '' })
  const [savingSource, setSavingSource] = useState(false)
  const [sourceError, setSourceError] = useState('')

  const [stageForm, setStageForm] = useState({ label: '' })
  const [savingStage, setSavingStage] = useState(false)
  const [stageError, setStageError] = useState('')
  const [editingStage, setEditingStage] = useState<{ id: string; label: string } | null>(null)

  const loadSources = () => {
    api.settings.sources.list().then(setSources).finally(() => setLoadingSources(false))
  }
  const loadStages = () => {
    api.settings.stages.list().then(setStages).finally(() => setLoadingStages(false))
  }

  useEffect(() => { loadSources(); loadStages() }, [])

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault()
    setSourceError('')
    setSavingSource(true)
    try {
      await api.settings.sources.create({
        name: sourceForm.name.toLowerCase().replace(/[\s.]+/g, '-'),
        label: sourceForm.label,
      })
      setSourceForm({ name: '', label: '' })
      loadSources()
    } catch {
      setSourceError('Quelle konnte nicht erstellt werden (Name bereits vorhanden?)')
    } finally {
      setSavingSource(false)
    }
  }

  const handleDeleteSource = async (id: string, label: string) => {
    if (!confirm(`Quelle "${label}" wirklich löschen?`)) return
    await api.settings.sources.delete(id)
    setSources(prev => prev.filter(s => s.id !== id))
  }

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault()
    setStageError('')
    setSavingStage(true)
    try {
      await api.settings.stages.create({
        key: stageForm.label.toLowerCase().replace(/[\s.]+/g, '-'),
        label: stageForm.label,
      })
      setStageForm({ label: '' })
      loadStages()
    } catch {
      setStageError('Stufe konnte nicht erstellt werden')
    } finally {
      setSavingStage(false)
    }
  }

  const handleUpdateStage = async (id: string) => {
    if (!editingStage) return
    await api.settings.stages.update(id, { label: editingStage.label })
    setEditingStage(null)
    loadStages()
  }

  const handleMoveStage = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= stages.length) return
    const a = stages[index]
    const b = stages[swapIndex]
    await Promise.all([
      api.settings.stages.update(a.id, { order: b.order }),
      api.settings.stages.update(b.id, { order: a.order }),
    ])
    loadStages()
  }

  const handleDeleteStage = async (id: string, label: string) => {
    if (!confirm(`Stufe "${label}" wirklich löschen?`)) return
    try {
      await api.settings.stages.delete(id)
      setStages(prev => prev.filter(s => s.id !== id))
    } catch {
      alert('Gewonnen und Verloren können nicht gelöscht werden.')
    }
  }

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>

      {/* ── Lead-Quellen ── */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Lead-Quellen</h3>
          <p className="text-sm text-gray-400 mt-0.5">Woher kommen deine Leads?</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {loadingSources ? (
            <li className="px-5 py-4 text-sm text-gray-400">Laden...</li>
          ) : sources.length === 0 ? (
            <li className="px-5 py-4 text-sm text-gray-400">Noch keine Quellen.</li>
          ) : sources.map(s => (
            <li key={s.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-400 font-mono">{s.name}</p>
              </div>
              <button
                onClick={() => handleDeleteSource(s.id, s.label)}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <form onSubmit={handleAddSource} className="flex gap-2">
            <input
              required
              placeholder="Name (z.B. Facebook)"
              value={sourceForm.label}
              onChange={e => setSourceForm({ label: e.target.value, name: e.target.value.toLowerCase().replace(/[\s.]+/g, '-') })}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={savingSource}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              + Hinzufügen
            </button>
          </form>
          {sourceError && <p className="text-xs text-red-500 mt-2">{sourceError}</p>}
        </div>
      </div>

      {/* ── Pipeline-Stufen ── */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Pipeline-Stufen</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Stufen die in der Pipeline angezeigt werden. Gewonnen und Verloren sind fix.
          </p>
        </div>
        <ul className="divide-y divide-gray-100">
          {loadingStages ? (
            <li className="px-5 py-4 text-sm text-gray-400">Laden...</li>
          ) : stages.map((s, i) => (
            <li key={s.id} className="px-5 py-3 flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMoveStage(i, 'up')}
                  disabled={i === 0}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs"
                >▲</button>
                <button
                  onClick={() => handleMoveStage(i, 'down')}
                  disabled={i === stages.length - 1}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs"
                >▼</button>
              </div>

              {editingStage?.id === s.id ? (
                <input
                  value={editingStage.label}
                  onChange={e => setEditingStage({ ...editingStage, label: e.target.value })}
                  className="flex-1 border border-blue-300 rounded-md px-2 py-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm text-gray-900">{s.label}</span>
              )}

              <span className={`text-xs px-2 py-0.5 rounded-full ${
                s.isWon  ? 'bg-green-100 text-green-700' :
                s.isLost ? 'bg-red-100 text-red-500' :
                s.showInPipeline ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {s.isWon ? 'Kunde' : s.isLost ? 'Verloren' : 'Pipeline'}
              </span>

              <div className="flex gap-1">
                {editingStage?.id === s.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateStage(s.id)}
                      className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditingStage(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Abbrechen
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingStage({ id: s.id, label: s.label })}
                      className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      Umbenennen
                    </button>
                    {!s.isWon && !s.isLost && (
                      <button
                        onClick={() => handleDeleteStage(s.id, s.label)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Löschen
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <form onSubmit={handleAddStage} className="flex gap-2">
            <input
              required
              placeholder="Neue Stufe (z.B. Angebot gesendet)"
              value={stageForm.label}
              onChange={e => setStageForm({ label: e.target.value })}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={savingStage}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              + Hinzufügen
            </button>
          </form>
          {stageError && <p className="text-xs text-red-500 mt-2">{stageError}</p>}
        </div>
      </div>
    </div>
  )
}
