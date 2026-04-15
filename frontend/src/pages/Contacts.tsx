import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, Contact } from '../api/client'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', company: '', notes: '' }

type Tab = 'all' | 'leads' | 'customers' | 'lost'
const TABS: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'Alle' },
  { key: 'leads',     label: 'Leads' },
  { key: 'customers', label: 'Kunden' },
  { key: 'lost',      label: 'Verloren' },
]

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const load = (q?: string) => {
    setLoading(true)
    api.contacts.list(q).then(setContacts).finally(() => setLoading(false))
  }

  const filtered = contacts.filter(c => {
    if (tab === 'leads')     return c.status !== 'won' && c.status !== 'lost'
    if (tab === 'customers') return c.status === 'won'
    if (tab === 'lost')      return c.status === 'lost'
    return true
  })

  useEffect(() => { load() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(search || undefined)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const contact = await api.contacts.create(form)
      navigate(`/contacts/${contact.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
        <button
          onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + New Contact
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-gray-400">
              {contacts.filter(c => {
                if (t.key === 'leads')     return c.status !== 'won' && c.status !== 'lost'
                if (t.key === 'customers') return c.status === 'won'
                if (t.key === 'lost')      return c.status === 'lost'
                return true
              }).length}
            </span>
          </button>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-lg p-5 mb-6 grid grid-cols-2 gap-3"
        >
          {(
            [
              ['firstName', 'Vorname', true],
              ['lastName', 'Nachname', true],
              ['email', 'E-Mail', true],
              ['phone', 'Telefon', false],
            ] as [keyof typeof form, string, boolean][]
          ).map(([key, placeholder, required]) => (
            <input
              key={key}
              required={required}
              placeholder={placeholder}
              type={key === 'email' ? 'email' : 'text'}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          ))}
          <input
            placeholder="Unternehmen"
            value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <textarea
            placeholder="Notizen"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm col-span-2 h-16 resize-none"
          />
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Speichern...' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Kontakte suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
        >
          Suchen
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); load() }}
            className="text-gray-400 px-3 py-2 text-sm hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </form>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-5 text-sm text-gray-400">Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="p-5 text-sm text-gray-400">Keine Einträge gefunden.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map(c => (
              <li key={c.id}>
                <Link to={`/contacts/${c.id}`} className="flex items-center px-5 py-3 hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm mr-3 flex-shrink-0">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.email}{c.company ? ` · ${c.company}` : ''}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 flex gap-3 flex-shrink-0">
                    <span>{c._count?.emails ?? 0} E-Mails</span>
                    <span>{c._count?.activities ?? 0} Aktivitäten</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
