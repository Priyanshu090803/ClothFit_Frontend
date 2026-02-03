'use client';

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { isLoggedIn, isLoading, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">ClothFit</span>
          </div>
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-sm font-medium text-violet-300">AI-Powered Virtual Try-On</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            See Clothes on Models
            <br />
            <span className="gradient-text">Before Production</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Upload a model photo and clothing item to generate realistic try-on images instantly.
            Perfect for fashion teams, e-commerce, and creative workflows.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isLoggedIn ? (
              <>
                <Link
                  href="/generate"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500"
                >
                  Start Generating
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/50 px-8 py-4 text-lg font-medium text-gray-300 transition-all hover:border-gray-600 hover:text-white"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500"
                >
                  Start Generating
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/50 px-8 py-4 text-lg font-medium text-gray-300 transition-all hover:border-gray-600 hover:text-white"
                >
                  Sign in to Dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20">
              <svg className="h-6 w-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Upload & Generate</h3>
            <p className="mt-2 text-sm text-gray-400">
              Simply upload your model and clothing photos
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/20">
              <svg className="h-6 w-6 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">AI-Powered</h3>
            <p className="mt-2 text-sm text-gray-400">
              Advanced Nano Banana AI generates realistic results
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Download Ready</h3>
            <p className="mt-2 text-sm text-gray-400">
              High-quality images ready for your workflow
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          © 2024 ClothFit. AI-powered virtual try-on for fashion teams.
        </div>
      </footer>
    </div>
  );
}
