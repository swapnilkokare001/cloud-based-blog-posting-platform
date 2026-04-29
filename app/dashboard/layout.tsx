'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PenSquare, FileText, Bell, Settings,
  User, BarChart2, LogOut, ChevronRight
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { getInitials } from '@/utils/helpers';
import Navbar from '@/components/layout/Navbar';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/blogs', label: 'My Posts', icon: FileText },
  { href: '/dashboard/blogs/create', label: 'Write Post', icon: PenSquare },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 bg-background flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card fixed left-0 top-16 bottom-0 overflow-y-auto">
          {/* User Info */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold overflow-hidden">
                {session.user.image
                  ? <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                  : getInitials(session.user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive(href, exact)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                <ChevronRight className={`w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${isActive(href, exact) ? 'opacity-60' : ''}`} />
              </Link>
            ))}

            {session.user.role === 'admin' && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admin</p>
                </div>
                <Link href="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    pathname.startsWith('/admin') ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}>
                  <BarChart2 className="w-4 h-4" />
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          {/* Signout */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 min-h-full">
          {children}
        </main>
      </div>
    </>
  );
}
