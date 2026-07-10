'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminLoginPage() {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin'

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      })

      if (res.ok) {
        router.push(from)
        router.refresh()
      } else {
        setError('Invalid access key. Please try again.')
        setKey('')
        inputRef.current?.focus()
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        .login-page {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%);
          top: -150px; right: -150px;
          border-radius: 50%;
          pointer-events: none;
        }

        .login-page::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          bottom: -100px; left: -100px;
          border-radius: 50%;
          pointer-events: none;
        }

        .login-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }

        .logo {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.5rem;
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .logo p {
          color: rgba(255,255,255,0.45);
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .form-group { margin-bottom: 1.25rem; }

        .form-label {
          display: block;
          color: rgba(255,255,255,0.7);
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .input-wrapper { position: relative; }

        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.875rem 3rem 0.875rem 1rem;
          color: #fff;
          font-size: 0.95rem;
          font-family: 'Inter', monospace;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .form-input:focus {
          border-color: rgba(220, 38, 38, 0.6);
          background: rgba(255,255,255,0.08);
        }

        .form-input::placeholder { color: rgba(255,255,255,0.25); }

        .toggle-btn {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          transition: color 0.2s;
        }
        .toggle-btn:hover { color: rgba(255,255,255,0.8); }

        .error-msg {
          background: rgba(220, 38, 38, 0.12);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #fca5a5;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none;
          border-radius: 10px;
          padding: 0.9rem;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
        }

        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .security-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.3);
          font-size: 0.78rem;
          justify-content: center;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="logo">
            <div className="logo-icon">🔐</div>
            <h1>Admin Access</h1>
            <p>desisexy.in control panel</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-msg">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="admin-key">Access Key</label>
              <div className="input-wrapper">
                <input
                  ref={inputRef}
                  id="admin-key"
                  type={showKey ? 'text' : 'password'}
                  className="form-input"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="Enter your secret access key..."
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowKey(v => !v)}
                  tabIndex={-1}
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="submit-btn"
              disabled={loading || !key.trim()}
            >
              {loading ? 'Verifying...' : 'Access Admin Panel →'}
            </button>
          </form>

          <div className="security-note">
            🛡️ Protected by secure session • Session expires in 24h
          </div>
        </div>
      </div>
    </>
  )
}
