import { useAuth } from '../../hooks';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-primary text-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/SECU-logo.png"
              alt="State Employees' Credit Union"
              className="h-8"
            />
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">
                Welcome, {user.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-white/80 hover:text-white transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
