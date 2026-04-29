'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchNotifications } from '@/redux/slices/notificationSlice';
import type { AppDispatch } from '@/redux/store';
import {
  PenSquare, Search, Bell, Sun, Moon, Menu, X,
  LogOut, User, LayoutDashboard, ChevronDown, Shield
} from 'lucide-react';
import { getInitials } from '@/utils/helpers';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCount } = useSelector((s: RootState) => s.notifications);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (session) dispatch(fetchNotifications());
  }, [session, dispatch]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-sm">B</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">BlogCloud</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blogs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Search
            </Link>
            {session?.user.role === 'admin' && (
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {session ? (
              <>
                {/* Notifications */}
                <Link href="/dashboard/notifications" className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Write Button */}
                <Link
                  href="/dashboard/blogs/create"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  Write
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-secondary transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                      {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(session.user.name)
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href={`/author/${session.user.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors" onClick={() => setProfileOpen(false)}>
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link href="/register" className="text-sm bg-primary text-white px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity font-medium">
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md pb-4">
            <div className="flex flex-col gap-1 pt-3">
              <Link href="/blogs" className="px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-md" onClick={() => setMobileOpen(false)}>
                Explore
              </Link>
              <Link href="/search" className="px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-md" onClick={() => setMobileOpen(false)}>
                Search
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-md" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/dashboard/blogs/create" className="px-4 py-2 text-sm text-primary font-medium hover:bg-secondary rounded-md" onClick={() => setMobileOpen(false)}>
                    Write a post
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 text-sm text-destructive text-left hover:bg-secondary rounded-md">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm text-foreground hover:bg-secondary rounded-md" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm text-primary font-medium hover:bg-secondary rounded-md" onClick={() => setMobileOpen(false)}>
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </header>
  );
}
