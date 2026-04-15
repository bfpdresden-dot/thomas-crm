import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import contactsRouter from './routes/contacts'
import emailsRouter from './routes/emails'
import activitiesRouter from './routes/activities'
import webhooksRouter from './routes/webhooks'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/contacts', contactsRouter)
app.use('/api/emails', emailsRouter)
app.use('/api/activities', activitiesRouter)
app.use('/api/webhooks', webhooksRouter)

// Serve frontend in production (backend serves the built React app)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendPath))
  app.get('*', (_, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Thomas CRM running on port ${PORT}`)
})
