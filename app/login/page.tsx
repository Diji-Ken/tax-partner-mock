'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        router.push('/');
      }
    } catch {
      setError('\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2744] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#ea580c] flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">TAX PARTNER</h1>
          <p className="text-sm text-white/40 mt-1">Powered by Rit</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 text-center">{'\u30ED\u30B0\u30A4\u30F3'}</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">{'\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9'}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yamada@sample-tax.co.jp"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30 focus:border-[#ea580c]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">{'\u30D1\u30B9\u30EF\u30FC\u30C9'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30 focus:border-[#ea580c]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? '\u30ED\u30B0\u30A4\u30F3\u4E2D...' : '\u30ED\u30B0\u30A4\u30F3'}
          </button>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">{'\u30C6\u30B9\u30C8\u30A2\u30AB\u30A6\u30F3\u30C8'}</p>
            <div className="mt-2 bg-slate-50 rounded-lg px-4 py-3 text-xs text-slate-500">
              <p>Email: yamada@sample-tax.co.jp</p>
              <p>Password: test1234</p>
            </div>
          </div>
        </form>

        <p className="text-xs text-white/30 text-center mt-6">&copy; 2026 TAX PARTNER. All rights reserved.</p>
      </div>
    </div>
  );
}
