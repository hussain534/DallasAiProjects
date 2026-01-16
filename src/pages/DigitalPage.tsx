import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Monitor } from 'lucide-react'

function DigitalPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-8">
      <button
        onClick={() => navigate('/')}
        className="btn-secondary flex items-center gap-2 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-purple-500 w-16 h-16 rounded-lg flex items-center justify-center text-white">
            <Monitor className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">DIGITAL</h1>
            <p className="text-[#94a3b8]">Digital banking and channels</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <p className="text-[#94a3b8] leading-relaxed">
            The Digital module powers modern digital banking experiences across web,
            mobile, and other channels. Enable seamless omnichannel experiences with
            responsive design, real-time notifications, and intuitive user interfaces
            that meet customer expectations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DigitalPage
