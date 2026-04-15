import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Contact, LeadStatus, PipelineStage } from '../api/client'

const STAGE_COLORS = [
  'bg-gray-50 border-gray-200',
  'bg-blue-50 border-blue-200',
  'bg-yellow-50 border-yellow-200',
  'bg-purple-50 border-purple-200',
  'bg-orange-50 border-orange-200',
]
const DOT_COLORS = ['bg-gray-400', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500']

const SOURCE_LABELS: Record<string, string> = {
  'bergmann-website': 'bergmannfinanzpartner.de',
  'brics-website': 'bricsplus-portfolio.de',
  'facebook': 'Facebook',
  'manual': 'Manuell',
}

export default function Pipeline() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([api.settings.stages.list(), api.leads.list()])
      .then(([s, c]) => {
        const pipelineKeys = s.filter(st => st.showInPipeline).map(st => st.key)
        setStages(s.filter(st => st.showInPipeline))
        setContacts(c.filter(contact => pipelineKeys.includes(contact.status)))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await api.leads.updateStatus(id, status)
    const pipelineKeys = stages.map(s => s.key)
    setContacts(prev =>
      prev.map(c => c.id === id ? { ...c, status } : c)
          .filter(c => pipelineKeys.includes(c.status))
    )
  }

  const byStage = (key: string) => contacts.filter(c => c.status === key)

  if (loading) return <div className="p-8 text-gray-400">Laden...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pipeline</h2>
        <span className="text-sm text-gray-400">{contacts.length} Kontakte gesamt</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => {
          const items = byStage(stage.key)
          return (
            <div key={stage.key} className="flex-shrink-0 w-64">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                <span className="font-semibold text-sm text-gray-700">{stage.label}</span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {items.map(contact => (
                  <div
                    key={contact.id}
                    className={`border rounded-lg p-3 ${STAGE_COLORS[i % STAGE_COLORS.length]}`}
                  >
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="block font-medium text-sm text-gray-900 hover:text-blue-700 truncate"
                    >
                      {contact.firstName} {contact.lastName}
                    </Link>

                    {contact.company && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{contact.company}</p>
                    )}

                    {contact.source && (
                      <p className="text-xs text-gray-400 mt-1">
                        {SOURCE_LABELS[contact.source] ?? contact.source}
                      </p>
                    )}

                    <div className="mt-2">
                      <select
                        value={contact.status}
                        onChange={e => handleStatusChange(contact.id, e.target.value as LeadStatus)}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-600"
                      >
                        {stages.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-300">
                    Leer
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
