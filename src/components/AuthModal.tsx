'use client'

import React, { useState } from 'react'
import { X, Mail, Lock, User, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { setCurrentUser } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password } : { email, password, name }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (data.success && data.user) {
        setCurrentUser(data.user)
        onClose()
        // Reset fields
        setEmail('')
        setPassword('')
        setName('')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#111115] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login' ? 'Login to comment, vote and save favorites' : 'Join DesiSexy.in community today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Choose username..."
                  className="w-full h-11 pl-10 pr-4 bg-brand-card hover:bg-neutral-900 focus:bg-black rounded-lg border border-white/10 focus:border-brand-accent outline-none text-sm text-white transition-all"
                />
                <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-11 pl-10 pr-4 bg-brand-card hover:bg-neutral-900 focus:bg-black rounded-lg border border-white/10 focus:border-brand-accent outline-none text-sm text-white transition-all"
              />
              <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 bg-brand-card hover:bg-neutral-900 focus:bg-black rounded-lg border border-white/10 focus:border-brand-accent outline-none text-sm text-white transition-all"
              />
              <Lock className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-brand-accent hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register Now'}
          </button>
        </form>

        {/* Footer switcher */}
        <div className="text-center mt-6 pt-4 border-t border-white/5 text-xs text-gray-400">
          {mode === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button 
                onClick={() => setMode('register')}
                className="text-brand-accent font-bold hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')}
                className="text-brand-accent font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
