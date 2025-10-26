'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-accent-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">KB</span>
              </div>
              <div>
                <span className="text-primary-700 font-bold text-xl">Knowledge Base</span>
                <p className="text-xs text-accent-500 font-semibold">Your Success - Our World</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/articles" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Articles
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Categories
            </Link>

            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors font-medium flex items-center gap-1">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{session.user.name || session.user.username}</p>
                    <p className="text-xs text-gray-500">{session.user.role}</p>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="btn-primary flex items-center gap-2">
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-primary-600 py-2">
                Home
              </Link>
              <Link href="/articles" className="text-gray-700 hover:text-primary-600 py-2">
                Articles
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-primary-600 py-2">
                Categories
              </Link>

              {status === 'authenticated' ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 py-2 flex items-center gap-2">
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{session.user.name || session.user.username}</p>
                    <p className="text-xs text-gray-500 mb-3">{session.user.role}</p>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link href="/login" className="btn-primary text-center">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}