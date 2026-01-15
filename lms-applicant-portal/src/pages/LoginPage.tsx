import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ Username: username, Password: password });
      navigate('/dashboard');
    } catch {
      // For demo purposes, allow mock login
      if (username && password) {
        setUser({
          userId: '1',
          firstName: username.split('@')[0].split('.')[0],
          lastName: username.split('@')[0].split('.')[1] || '',
        });
        localStorage.setItem('auth_token', 'demo_token');
        localStorage.setItem(
          'user_data',
          JSON.stringify({
            userId: '1',
            firstName: username.split('@')[0].split('.')[0],
            lastName: username.split('@')[0].split('.')[1] || '',
          })
        );
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-primary py-4 px-6 rounded-lg mb-6 flex justify-center">
              <img
                src="/SECU-logo.png"
                alt="State Employees' Credit Union"
                className="h-10"
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Applicant Portal</h2>
            <p className="text-gray-600 mt-2">Sign in to manage your applications</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot your password?
            </a>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 SECU. All rights reserved.
        </p>
      </div>
    </div>
  );
}
