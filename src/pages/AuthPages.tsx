import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onNavigate: (route: string, params?: any) => void;
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onNavigate,
  onSuccess,
}) => {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          firstName,
          lastName,
          phone,
        });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        const adminEmails = ['omas7th@gmail.com', 'angelkimberly1st@gmail.com', 'admin@houndandharbor.com'];
        if (adminEmails.includes(email.toLowerCase().trim())) {
          onNavigate('admin');
        } else {
          onNavigate('account');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F3F1] px-3.5 py-1 text-xs font-semibold text-[#0E5E58] mb-3">
            <ShieldCheck size={14} />
            <span>Hound &amp; Harbor Member Access</span>
          </div>
          <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create Pet Parent Account'}
          </h1>
          <p className="mt-1 text-xs text-[#525B67]">
            Manage your dog’s nutrition profile, autoship orders, and paw rewards.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-gray-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 pl-9 text-xs focus:border-[#0E5E58] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 pl-9 text-xs focus:border-[#0E5E58] focus:outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="font-bold text-gray-700 block mb-1">Mobile Phone (for delivery SMS updates)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                />
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#0E5E58] py-3 text-xs font-bold text-white shadow-md hover:bg-[#0B4A45] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-[#525B67]">
            {mode === 'login' ? (
              <div>
                Don’t have an account yet?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-bold text-[#0E5E58] hover:underline"
                >
                  Create one here
                </button>
              </div>
            ) : (
              <div>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-[#0E5E58] hover:underline"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
