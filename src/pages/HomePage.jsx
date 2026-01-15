import { useState } from 'react'
import {
  CreditCard,
  Users,
  Smartphone,
  DollarSign,
  UserPlus,
  ArrowLeft,
  Building2,
  Layers
} from 'lucide-react'

const systemIcons = {
  cards: CreditCard,
  crm: Users,
  digital: Smartphone,
  payments: DollarSign,
  onboarding: UserPlus,
}

const systemColors = {
  cards: 'bg-blue-500',
  crm: 'bg-green-500',
  digital: 'bg-purple-500',
  payments: 'bg-yellow-500',
  onboarding: 'bg-indigo-500',
}

export function HomePage({ systems, onSelectSystem }) {
  const [expandedSystem, setExpandedSystem] = useState(null)

  // Filter to only show main systems (not sub-systems)
  const mainSystems = systems.filter(s => !s.parentId)

  // Get sub-systems for an expanded system
  const getSubSystems = (systemId) => {
    const parentSystem = systems.find(s => s.id === systemId)
    if (!parentSystem?.subSystems) return []
    return systems.filter(s => parentSystem.subSystems.includes(s.id))
  }

  const handleSystemClick = (system) => {
    if (system.hasSubSystems) {
      setExpandedSystem(system.id)
    } else {
      onSelectSystem(system.id)
    }
  }

  const handleBackClick = () => {
    setExpandedSystem(null)
  }

  // If a system with sub-systems is expanded, show the sub-system selection
  if (expandedSystem) {
    const parentSystem = systems.find(s => s.id === expandedSystem)
    const subSystems = getSubSystems(expandedSystem)

    return (
      <div>
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Systems</span>
          </button>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
            {parentSystem.name}
          </h1>
          <p className="text-lg" style={{ color: '#FFFFFF' }}>
            Select a cards system to explore
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {subSystems.map((subSystem) => {
            const isBlue = subSystem.color === '#3B82F6'
            const bgColor = isBlue ? 'bg-blue-500' : 'bg-purple-500'
            const hoverBorder = isBlue ? 'hover:border-blue-400' : 'hover:border-purple-400'
            const Icon = isBlue ? Building2 : Layers

            return (
              <button
                key={subSystem.id}
                onClick={() => onSelectSystem(subSystem.id)}
                className={`card hover:shadow-xl transition-all duration-300 text-left group border-2 border-transparent ${hoverBorder}`}
              >
                <div className={`w-16 h-16 ${bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{subSystem.name}</h3>
                <p className="text-[#4A5568] text-base">{subSystem.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Default view - show all main systems
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
          Banking Ecosystem Demo
        </h1>
        <p className="text-lg" style={{ color: '#FFFFFF' }}>
          Explore our comprehensive suite of banking solutions and API integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainSystems.map((system) => {
          const Icon = systemIcons[system.icon] || CreditCard
          const colorClass = systemColors[system.icon] || 'bg-blue-500'
          return (
            <button
              key={system.id}
              onClick={() => handleSystemClick(system)}
              className="card hover:shadow-lg transition-all duration-300 text-left group"
            >
              <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{system.name}</h3>
              <p className="text-[#4A5568]">{system.description}</p>
              {system.hasSubSystems && (
                <span className="inline-block mt-3 text-xs text-blue-500 font-medium">
                  Click to see options →
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default HomePage
