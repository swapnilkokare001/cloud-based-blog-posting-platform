import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — BlogCloud',
  description: 'Privacy Policy for BlogCloud. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

          <div className="prose-custom space-y-8">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you create an account on BlogCloud, we collect your name, email address, and
                profile information you choose to provide. When you publish content, we store your
                blog posts, comments, and associated media files on our cloud infrastructure.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>To provide and maintain the BlogCloud platform</li>
                <li>To personalize your experience and display your content</li>
                <li>To send notifications about interactions with your posts</li>
                <li>To improve our services and fix technical issues</li>
                <li>To protect against spam, abuse, and unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is stored securely using industry-standard cloud services including
                MongoDB Atlas for database storage and AWS S3 for media files. All data is encrypted
                in transit using TLS/SSL. We implement appropriate security measures to protect
                against unauthorized access, alteration, or destruction of your personal information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Cookies</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use essential cookies to maintain your authentication session and remember your
                preferences (such as dark/light theme). We do not use third-party tracking cookies
                or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BlogCloud uses the following third-party services to operate:
              </p>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
                <li><strong className="text-foreground">AWS (Amazon Web Services)</strong> — for file storage and content delivery</li>
                <li><strong className="text-foreground">MongoDB Atlas</strong> — for database hosting</li>
                <li><strong className="text-foreground">Google OAuth</strong> — for optional social login (when configured)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal information at any time
                through your account settings. You can delete your blog posts and comments directly
                from the dashboard. To request full account deletion, please contact us.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Contact</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please reach out via our{' '}
                <Link href="https://github.com/swapnilkokare001" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  GitHub repository
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
