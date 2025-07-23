'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from './actions'

export const dynamic = 'force-dynamic'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-3 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 font-semibold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </div>
      ) : (
        'Login'
      )}
    </button>
  )
}

export default function LoginPage() {
  const initialState = { message: '', errors: {} }
  const [state, dispatch] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header with Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg border-4 border-red-100 mb-6">
            <img 
              src="/logo/logo.png" 
              alt="SITRACK Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to SVG icon if logo fails to load
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                if (img.nextSibling && img.nextSibling instanceof SVGElement) {
                  (img.nextSibling as SVGElement).style.display = 'block'
                }
              }}
            />
            <svg 
              className="w-10 h-10 text-red-600 hidden" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{ display: 'none' }}
            >
              <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5zM12 4.18L20 8v9H4V8l8-3.82z"/>
              <path d="M12 8l-6 4.5V17h12v-4.5L12 8z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">
            SITRACK
          </h1>
          <p className="text-gray-600 text-sm font-medium">Site Acquisition Tracking System</p>
          <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full mx-auto mt-3"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Masuk ke <span className="text-red-600">SITRACK</span>
          </h2>
          
          <form action={dispatch} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 pl-12 placeholder-gray-400 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  placeholder="Masukkan email Anda"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
              </div>
              {state?.errors?.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-md">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 pl-12 placeholder-gray-400 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  placeholder="Masukkan password Anda"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              {state?.errors?.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-md">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>

            {state?.message && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-sm">
                <p className="text-sm text-red-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {state.message}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 font-medium">
            © 2025 SITRACK
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PT Telkom Infrastruktur Indonesia
          </p>
        </div>
      </div>
    </div>
  )
}