import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Contact, LeadStatus } from '../api/client'

const STAGES: { key: LeadStatus; label: string; color: string; dot: string }[] = [
  { key: 'new',        label: 'Neu',          color: 'bg-gray-50 border-gray-200',     dot: 'bg-gray-400' },
  { key: 'contacted',  label: 'Kontaktiert',  color: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-500' },
  { key: 'qualified',  label: 'Qualifiziert', color: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
]

const PIPELINE_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified']

const SOURCE_LABELS: Record<string, string> = {
  'bergmann-website': 'bergmannfinanzpartner.de',
  'brics-website': 'bricsplus-portfolio.de',
  'facebook': 'Facebook',
  'manual': 'Manuell',
}

export default function Pipeline() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.leads.list()
      .then(data => setContacts(data.filter(c => PIPELINE_STATUSES.includes(c.status))))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await api.leads.updateStatus(id, status)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c).filter(c => PIPELINE_STATUSES.includes(c.status)))
  }

  const byStage = (key: LeadStatus) => contacts.filter(c => c.status === key)

  if (loading) return <div className="p-8 text-gray-400">Laden...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pipeline</h2>
        <span className="text-sm text-gray-400">{contacts.length} Kontakte gesamt</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const items = byStage(stage.key)
          return (
            <div key={stage.key} className="flex-shrink-0 w-64">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
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
                    className={`border rounded-lg p-3 ${stage.color}`}
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
                        {STAGES.map(s => (
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
