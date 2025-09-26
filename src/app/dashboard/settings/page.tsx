'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from '@/components/theme/ThemeProvider';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { ArrowLeftIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-white hover:text-purple-300 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <CogIcon className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">Settings</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <UserIcon className="h-5 w-5" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Theme Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Theme</h3>
                  <p className="text-gray-300 text-sm">
                    Choose between light and dark themes for the entire application
                  </p>
                </div>
                <ThemeToggle />
              </div>
              
              <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-gray-300">
                  Current theme: <span className="font-medium text-white capitalize">{theme}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Your theme preference is saved automatically and will be applied across all pages.
                </p>
              </div>
            </div>
          </div>

          {/* Editor Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Editor Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Default Editor</h3>
                  <p className="text-gray-300 text-sm">
                    Choose your preferred document editor
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    OnlyOffice
                  </button>
                  <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600">
                    Custom Editor
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email address cannot be changed here. Contact support if needed.
                </p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">About LoreWise</h2>
            <div className="space-y-2 text-gray-300">
              <p>Version: 1.0.0</p>
              <p>Built with Next.js, React, and OnlyOffice Document Server</p>
              <p className="text-sm text-gray-400 mt-4">
                "Love isn't luck — it's intention."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
