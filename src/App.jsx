import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import SystemPage from './pages/SystemPage'
import systemsData from './data/systems.json'

function App() {
  const [currentSystem, setCurrentSystem] = useState(null)
  const { systems } = systemsData

  const selectedSystem = systems.find(s => s.id === currentSystem)

  const handleHomeClick = () => {
    setCurrentSystem(null)
  }

  const handleSystemChange = (systemId) => {
    setCurrentSystem(systemId)
  }

  const handleSettingsClick = () => {
    console.log('Settings clicked')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#283054] via-[#1e2438] to-[#0f172a]">
      <Sidebar
        systems={systems}
        currentSystem={currentSystem}
        onSystemChange={handleSystemChange}
        onHomeClick={handleHomeClick}
        onSettingsClick={handleSettingsClick}
      />

      <main className="transition-all duration-300 min-h-screen p-8" style={{ marginLeft: '5rem' }}>
        <Header />

        {currentSystem ? (
          <SystemPage
            system={selectedSystem}
            onBack={handleHomeClick}
          />
        ) : (
          <HomePage
            systems={systems}
            onSelectSystem={handleSystemChange}
          />
        )}
      </main>
    </div>
  )
}

export default App
