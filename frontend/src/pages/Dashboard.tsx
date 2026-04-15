import { useEffect, useState } from 'react'
import { api, Contact, Activity } from '../api/client'

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.contacts.list(), api.activities.list()])
      .then(([c, a]) => { setContacts(c); setActivities(a) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  const companies = new Set(contacts.map(c => c.company).filter(Boolean)).size

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Contacts</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Activities</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{activities.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Companies</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{companies}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {activities.slice(0, 15).map(a => (
            <li key={a.id} className="px-5 py-3 flex items-start gap-3">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-0.5 capitalize whitespace-nowrap">
                {a.type}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-gray-900 truncate">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(a.createdAt).toLocaleString('de-DE')}
                </p>
              </div>
            </li>
          ))}
          {activities.length === 0 && (
            <li className="px-5 py-4 text-sm text-gray-400">Noch keine Aktivitäten.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
