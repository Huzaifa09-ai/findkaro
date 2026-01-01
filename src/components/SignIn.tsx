import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const { login, signup, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'merchant' | 'customer'>('customer');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignup) await signup(email, password, role);
      else await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-2">{isSignup ? 'Create an account' : 'Sign in'}</h3>
      <p className="text-sm text-slate-400 mb-4">{isSignup ? 'Sign up as merchant or customer' : 'Sign in to continue'}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded-xl border" required />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-3 rounded-xl border" required />
        {isSignup && (
          <div className="flex gap-2">
            <button type="button" onClick={() => setRole('customer')} className={`flex-1 p-2 rounded-xl ${role === 'customer' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Customer</button>
            <button type="button" onClick={() => setRole('merchant')} className={`flex-1 p-2 rounded-xl ${role === 'merchant' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Merchant</button>
          </div>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 text-white" disabled={isLoading}>{isLoading ? 'Please wait...' : (isSignup ? 'Create account' : 'Sign in')}</button>
          <button type="button" onClick={() => setIsSignup(!isSignup)} className="py-3 px-4 rounded-xl border">{isSignup ? 'Have an account?' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
