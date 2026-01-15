import {
  Home,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Users,
  Smartphone,
  DollarSign,
  UserPlus,
  Building2,
  Layers
} from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

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

export function Sidebar({
  systems,
  currentSystem,
  onSystemChange,
  onHomeClick,
  onSettingsClick
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [expandedParent, setExpandedParent] = useState(null)

  // Filter to only show main systems (not sub-systems)
  const mainSystems = systems.filter(s => !s.parentId)

  // Get sub-systems for an expanded system
  const getSubSystems = (systemId) => {
    const parentSystem = systems.find(s => s.id === systemId)
    if (!parentSystem?.subSystems) return []
    return systems.filter(s => parentSystem.subSystems.includes(s.id))
  }

  // Check if current system is a sub-system of a parent
  useEffect(() => {
    if (currentSystem) {
      const current = systems.find(s => s.id === currentSystem)
      if (current?.parentId) {
        setExpandedParent(current.parentId)
      }
    }
  }, [currentSystem, systems])

  useEffect(() => {
    if (!hovered && !isCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [hovered, isCollapsed])

  const isExpanded = hovered || !isCollapsed

  useEffect(() => {
    document.body.setAttribute('data-sidebar', isExpanded ? 'expanded' : 'collapsed')
  }, [isExpanded])

  const handleSystemClick = (system) => {
    if (system.hasSubSystems) {
      setExpandedParent(expandedParent === system.id ? null : system.id)
    } else {
      onSystemChange?.(system.id)
    }
  }

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-full bg-[#283054] flex flex-col py-6 z-50 shadow-xl transition-all duration-300",
        isExpanded ? "w-80" : "w-20"
      )}
      onMouseEnter={() => {
        setHovered(true)
        setIsCollapsed(false)
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-[#283054] text-white p-1 rounded-full shadow-lg hover:bg-[#1e2438] transition-colors z-10 border-2 border-blue-800/50"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Logo */}
      <div className={clsx("px-6 mb-8 transition-opacity", isExpanded ? "opacity-100" : "opacity-0")}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">BSG</span>
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">Banking</span>
              <span className="text-blue-300 text-xs">Ecosystem Demo</span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Logo (when collapsed) */}
      {!isExpanded && (
        <div className="px-6 mb-8 flex justify-center">
          <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">BSG</span>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col px-4 space-y-3 overflow-y-auto">
        {/* Home Button */}
        <button
          onClick={onHomeClick}
          className={clsx(
            "text-white hover:text-blue-300 hover:bg-blue-900/30 transition-colors p-3 rounded-lg flex items-center",
            isExpanded ? "space-x-3" : "justify-center"
          )}
          title="Home - Return to system selection"
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Home</span>}
        </button>

        {/* System Cards */}
        <div className={clsx("space-y-3", !isExpanded && "space-y-2")}>
          {isExpanded && (
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
              Banking Systems
            </p>
          )}
          {mainSystems.map((system) => {
            const Icon = systemIcons[system.icon] || CreditCard
            const colorClass = systemColors[system.icon] || 'bg-blue-500'
            const isActive = currentSystem === system.id
            const isParentExpanded = expandedParent === system.id
            const subSystems = getSubSystems(system.id)
            const hasActiveSubSystem = subSystems.some(sub => sub.id === currentSystem)

            return (
              <div key={system.id}>
                <button
                  onClick={() => handleSystemClick(system)}
                  className={clsx(
                    "w-full rounded-lg transition-all duration-200 text-left",
                    isExpanded
                      ? clsx(
                          "p-4 border",
                          isActive || hasActiveSubSystem
                            ? "bg-blue-900/30 border-blue-700/50 text-blue-400"
                            : "bg-blue-900/10 border-blue-800/30 text-white hover:bg-blue-900/20 hover:border-blue-700/50"
                        )
                      : clsx(
                          "p-3 flex justify-center",
                          isActive || hasActiveSubSystem
                            ? "bg-blue-900/30 text-blue-400"
                            : "text-white hover:bg-blue-900/20"
                        )
                  )}
                  title={system.name}
                >
                  {isExpanded ? (
                    <div className="flex items-start space-x-3">
                      <div className={clsx("w-10 h-10", colorClass, "rounded-lg flex items-center justify-center flex-shrink-0")}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm mb-1">{system.name}</h4>
                          {system.hasSubSystems && (
                            <ChevronDown className={clsx(
                              "w-4 h-4 transition-transform",
                              isParentExpanded && "rotate-180"
                            )} />
                          )}
                        </div>
                        <p className="text-xs text-blue-200/80 line-clamp-2">{system.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={clsx("w-10 h-10", colorClass, "rounded-lg flex items-center justify-center")}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>

                {/* Sub-systems */}
                {isExpanded && isParentExpanded && subSystems.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-blue-700/30 pl-3">
                    {subSystems.map((subSystem) => {
                      const isBlue = subSystem.color === '#3B82F6'
                      const subColorClass = isBlue ? 'bg-blue-500' : 'bg-purple-500'
                      const SubIcon = isBlue ? Building2 : Layers
                      const isSubActive = currentSystem === subSystem.id

                      return (
                        <button
                          key={subSystem.id}
                          onClick={() => onSystemChange?.(subSystem.id)}
                          className={clsx(
                            "w-full rounded-lg transition-all duration-200 text-left p-3 border",
                            isSubActive
                              ? "bg-blue-900/40 border-blue-600/50 text-blue-300"
                              : "bg-blue-900/10 border-blue-800/30 text-white hover:bg-blue-900/20 hover:border-blue-700/50"
                          )}
                          title={subSystem.name}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={clsx("w-8 h-8", subColorClass, "rounded-md flex items-center justify-center flex-shrink-0")}>
                              <SubIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs">{subSystem.name}</h4>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col space-y-2 pt-4 px-4">
        <button
          onClick={onSettingsClick}
          className={clsx(
            "w-full text-white hover:text-blue-300 hover:bg-blue-900/20 transition-colors p-3 rounded-lg flex items-center",
            isExpanded ? "space-x-3" : "justify-center"
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button
          className={clsx(
            "w-full text-white hover:text-blue-300 hover:bg-blue-900/20 transition-colors p-3 rounded-lg flex items-center",
            isExpanded ? "space-x-3" : "justify-center"
          )}
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
