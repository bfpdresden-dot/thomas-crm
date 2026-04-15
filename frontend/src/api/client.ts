import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  notes?: string
  status: LeadStatus
  source?: string
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
    create: (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | '_count' | 'emails' | 'activities' | 'status'>) =>
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
  leads: {
    list: () => client.get<Contact[]>('/leads').then(r => r.data),
    updateStatus: (id: string, status: LeadStatus) =>
      client.patch<Contact>(`/leads/${id}/status`, { status }).then(r => r.data),
  },
  settings: {
    sources: {
      list: () => client.get<Source[]>('/settings/sources').then(r => r.data),
      create: (data: { name: string; label: string }) =>
        client.post<Source>('/settings/sources', data).then(r => r.data),
      delete: (id: string) => client.delete(`/settings/sources/${id}`),
    },
    stages: {
      list: () => client.get<PipelineStage[]>('/settings/stages').then(r => r.data),
      create: (data: { key: string; label: string }) =>
        client.post<PipelineStage>('/settings/stages', data).then(r => r.data),
      update: (id: string, data: { label?: string; order?: number }) =>
        client.patch<PipelineStage>(`/settings/stages/${id}`, data).then(r => r.data),
      delete: (id: string) => client.delete(`/settings/stages/${id}`),
    },
  },
}

export interface Source {
  id: string
  name: string
  label: string
  createdAt: string
}

export interface PipelineStage {
  id: string
  key: string
  label: string
  order: number
  showInPipeline: boolean
  isWon: boolean
  isLost: boolean
}

export default client
