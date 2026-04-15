import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  notes?: string
  createdAt: string
  updatedAt: string
  _count?: { emails: number; activities: number }
  emails?: Email[]
  activities?: Activity[]
}

export interface Email {
  id: string
  contactId: string
  subject: string
  body: string
  fromAddr: string
  toAddr: string
  sentAt?: string
  createdAt: string
}

export interface Activity {
  id: string
  contactId?: string
  type: string
  title: string
  description?: string
  createdAt: string
}

export interface WebhookLog {
  id: string
  source: string
  event: string
  payload: unknown
  receivedAt: string
  processed: boolean
}

export const api = {
  contacts: {
    list: (search?: string) =>
      client.get<Contact[]>('/contacts', { params: search ? { search } : undefined }).then(r => r.data),
    get: (id: string) => client.get<Contact>(`/contacts/${id}`).then(r => r.data),
    create: (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | '_count' | 'emails' | 'activities'>) =>
      client.post<Contact>('/contacts', data).then(r => r.data),
    update: (id: string, data: Partial<Contact>) =>
      client.patch<Contact>(`/contacts/${id}`, data).then(r => r.data),
    delete: (id: string) => client.delete(`/contacts/${id}`),
  },
  emails: {
    list: (contactId?: string) =>
      client.get<Email[]>('/emails', { params: contactId ? { contactId } : undefined }).then(r => r.data),
    create: (data: { contactId: string; subject: string; body: string; toAddr: string }) =>
      client.post<Email>('/emails', data).then(r => r.data),
  },
  activities: {
    list: (contactId?: string) =>
      client.get<Activity[]>('/activities', { params: contactId ? { contactId } : undefined }).then(r => r.data),
    create: (data: { contactId?: string; type: string; title: string; description?: string }) =>
      client.post<Activity>('/activities', data).then(r => r.data),
    delete: (id: string) => client.delete(`/activities/${id}`),
  },
  webhooks: {
    logs: (source?: string) =>
      client.get<WebhookLog[]>('/webhooks/logs', { params: source ? { source } : undefined }).then(r => r.data),
  },
}

export default client
