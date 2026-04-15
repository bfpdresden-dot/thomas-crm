import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api, Contact } from '../api/client'
import EmailCompose from '../components/EmailCompose'

const ACTIVITY_TYPES = ['note', 'call', 'meeting', 'task']

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  const [activityForm, setActivityForm] = useState({ type: 'note', title: '', description: '' })
  const [logging, setLogging] = useState(false)

  const load = () => {
    if (!id) return
    api.contacts.get(id).then(setContact).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!id || !confirm(`Kontakt "${contact?.firstName} ${contact?.lastName}" wirklich löschen?`)) return
    await api.contacts.delete(id)
    navigate('/contacts')
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !activityForm.title) return
    setLogging(true)
    try {
      await api.activities.create({ contactId: id, ...activityForm })
      setActivityForm({ type: 'note', title: '', description: '' })
      load()
    } finally {
      setLogging(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Laden...</div>
  if (!contact) return <div className="p-8 text-gray-400">Kontakt nicht gefunden.</div>

  // Merge emails + activities into a unified timeline sorted by date
  const timeline = [
    ...(contact.activities ?? []).map(a => ({ ...a, _kind: 'activity' as const })),
    ...(contact.emails ?? []).map(e => ({ ...e, _kind: 'email' as const, createdAt: e.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link to="/contacts" className="hover:text-gray-700">Contacts</Link>
        <span>/</span>
        <span className="text-gray-700">{contact.firstName} {contact.lastName}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Contact card */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mb-3">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {contact.firstName} {contact.lastName}
            </h2>
            {contact.company && (
              <p className="text-sm text-gray-500 mt-0.5">{contact.company}</p>
            )}
            <div className="mt-4 space-y-1.5 text-sm text-gray-700">
              <p>{contact.email}</p>
              {contact.phone && <p>{contact.phone}</p>}
            </div>
            {contact.notes && (
              <p className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                {contact.notes}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowEmail(!showEmail)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                E-Mail senden
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-5">
          {showEmail && (
            <EmailCompose
              contact={contact}
              onSent={() => { setShowEmail(false); load() }}
              onCancel={() => setShowEmail(false)}
            />
          )}

          {/* Log activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Aktivität erfassen</h3>
            <form onSubmit={handleAddActivity} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={activityForm.type}
                  onChange={e => setActivityForm({ ...activityForm, type: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {ACTIVITY_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                <input
                  required
                  placeholder="Titel"
                  value={activityForm.title}
                  onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <textarea
                placeholder="Beschreibung (optional)"
                value={activityForm.description}
                onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-16 resize-none"
              />
              <button
                type="submit"
                disabled={logging}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
              >
                {logging ? 'Speichern...' : 'Erfassen'}
              </button>
            </form>
          </div>

          {/* Unified timeline */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Timeline</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {timeline.map(item => (
                <li key={item.id} className="px-5 py-3 flex items-start gap-3">
                  {item._kind === 'email' ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
                      email
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-0.5 capitalize whitespace-nowrap">
                      {(item as { type: string }).type}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{item.title}</p>
                    {'description' in item && item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                    {'toAddr' in item && (
                      <p className="text-xs text-gray-500 mt-0.5">An: {item.toAddr}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleString('de-DE')}
                    </p>
                  </div>
                </li>
              ))}
              {timeline.length === 0 && (
                <li className="px-5 py-4 text-sm text-gray-400">Noch keine Einträge.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
