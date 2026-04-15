import { useState } from 'react'
import { api, Contact } from '../api/client'

interface Props {
  contact: Contact
  onSent: () => void
  onCancel: () => void
}

export default function EmailCompose({ contact, onSent, onCancel }: Props) {
  const [form, setForm] = useState({
    subject: '',
    body: '',
    toAddr: contact.email,
  })
  const [sending, setSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await api.emails.create({ contactId: contact.id, ...form })
      onSent()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-3">E-Mail verfassen</h3>
      <form onSubmit={handleSend} className="space-y-3">
        <input
          type="email"
          value={form.toAddr}
          onChange={e => setForm({ ...form, toAddr: e.target.value })}
          placeholder="An"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          value={form.subject}
          onChange={e => setForm({ ...form, subject: e.target.value })}
          placeholder="Betreff"
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <textarea
          value={form.body}
          onChange={e => setForm({ ...form, body: e.target.value })}
          placeholder="Nachricht..."
          required
          rows={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={sending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Senden...' : 'Senden'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
