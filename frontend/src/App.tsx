import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import ContactDetail from './pages/ContactDetail'
import Pipeline from './pages/Pipeline'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Thomas CRM</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            Contacts
          </NavLink>
          <NavLink
            to="/pipeline"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            Pipeline
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
        </Routes>
      </main>
    </div>
  )
}
