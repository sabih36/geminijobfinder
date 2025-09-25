import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { BriefcaseIcon } from '../components/Icons';

type AuthMode = 'signin' | 'signup';

const Auth: React.FC = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [companyName, setCompanyName] = useState('');

  const handleTabClick = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    // Reset fields
    setName('');
    setEmail('');
    setPassword('');
    setRole('student');
    setCompanyName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        if (mode === 'signin') {
            const user = await login(email, password);
            if (!user) {
                setError('Invalid email or password.');
            }
        } else {
            const user = await signup(name, email, password, role, companyName);
            if (!user) {
                setError('A user with this email already exists.');
            }
        }
    } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg
        focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
        ${active ? 'bg-primary text-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
                {BriefcaseIcon}
            </div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-text">
                {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
            </h2>
        </div>

        <div className="flex p-1 space-x-1 bg-primary/20 rounded-xl">
          <TabButton active={mode === 'signin'} onClick={() => handleTabClick('signin')}>Sign In</TabButton>
          <TabButton active={mode === 'signup'} onClick={() => handleTabClick('signup')}>Sign Up</TabButton>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {mode === 'signup' && (
            <>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'recruiter')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="student">I am a Student</option>
                <option value="recruiter">I am a Recruiter</option>
              </select>
              {role === 'recruiter' && (
                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          
          <Button type="submit" isLoading={isLoading} className="w-full">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;