import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <p className="font-display text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Go home
          </Link>
          <Link href="/search"
            className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-xl font-medium text-foreground hover:bg-secondary transition-colors">
            <Search className="w-4 h-4" /> Search posts
          </Link>
        </div>
      </div>
    </div>
  );
}
