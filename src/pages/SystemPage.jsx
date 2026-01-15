import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Play,
  Code
} from 'lucide-react'

export function SystemPage({ system, onBack }) {
  if (!system) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">System not found</p>
      </div>
    )
  }

  const { name, description, overview, color, apis, documentation, demoLinks } = system

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Systems</span>
          </button>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>{name}</h1>
          <p className="text-lg" style={{ color: '#E2E8F0' }}>{description}</p>
        </div>
      </div>

      {/* Overview Card */}
      {overview && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-[#2D3748]">Overview</h2>
          <p className="text-[#4A5568] leading-relaxed">{overview}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* APIs Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <Code className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-bold text-[#2D3748]">APIs & Developer Portal</h2>
            </div>
            <div className="space-y-4">
              {apis?.map((api, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{api.name}</span>
                      {api.version && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          v{api.version}
                        </span>
                      )}
                    </div>
                    {api.description && (
                      <p className="text-sm text-gray-600">{api.description}</p>
                    )}
                  </div>
                  <a
                    href={api.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: color || '#3B82F6',
                      color: '#FFFFFF'
                    }}
                  >
                    <span>View in Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Documentation */}
          {documentation && documentation.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <FileText className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-bold text-[#2D3748]">Documentation</h3>
              </div>
              <div className="space-y-3">
                {documentation.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-white transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {doc.title}
                        </span>
                        {doc.description && (
                          <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Demo Links */}
          {demoLinks && demoLinks.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <Play className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-bold text-[#2D3748]">Demo Environment</h3>
              </div>
              <div className="space-y-3">
                {demoLinks.map((demo, index) => (
                  <a
                    key={index}
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-300 hover:bg-white transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                          {demo.title}
                        </span>
                        {demo.description && (
                          <p className="text-sm text-gray-500 mt-1">{demo.description}</p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemPage
