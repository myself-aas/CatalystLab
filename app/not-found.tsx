'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c0c0f] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-mono text-[#5b5bf6] mb-3">404</p>
      <h1 className="text-2xl font-semibold text-[#eeeef2] mb-2">
        Page not found
      </h1>
      <p className="text-sm text-[#9898b0] mb-8 max-w-sm">
        This page does not exist or has been moved.
      </p>
      <Link href="/dashboard"
        className="bg-[#5b5bf6] hover:bg-[#6d6df8] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-150">
        Go to Dashboard
      </Link>
    </div>
  )
}
