import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — BlogCloud',
  description: 'Terms of Service for BlogCloud. Review the rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

          <div className="prose-custom space-y-8">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By creating an account or using BlogCloud, you agree to be bound by these Terms of
                Service. If you do not agree to these terms, please do not use the platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. User Accounts</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>You must provide accurate information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must be at least 13 years old to use BlogCloud</li>
                <li>One person may not maintain more than one account</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Content Guidelines</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                You retain ownership of all content you publish on BlogCloud. However, by posting
                content, you grant BlogCloud a non-exclusive license to display, distribute, and
                promote your content on the platform.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You agree not to publish content that:
              </p>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains hate speech, harassment, or threats</li>
                <li>Includes spam, malware, or misleading information</li>
                <li>Violates any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Media Uploads</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Images and media uploaded to BlogCloud are stored on AWS S3. You are responsible for
                ensuring you have the right to upload and publish any media content. BlogCloud
                reserves the right to remove content that violates these terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Account Termination</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BlogCloud reserves the right to suspend or terminate accounts that violate these
                terms. You may delete your account at any time, which will remove your profile
                information. Published content may be retained for a reasonable period for backup
                purposes.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Disclaimer</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BlogCloud is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
                uninterrupted access to the platform. We are not liable for any content published
                by users or any damages resulting from use of the platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Changes to Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update these terms from time to time. Continued use of BlogCloud after
                changes constitutes acceptance of the new terms. Significant changes will be
                communicated through the platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Contact</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please visit our{' '}
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
