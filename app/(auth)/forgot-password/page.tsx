'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    // In a real implementation, call /api/auth/forgot-password
    // For this project, simulate the request
    await new Promise((r) => setTimeout(r, 1000));
    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        {submitted ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-1">
              We sent a password reset link to
            </p>
            <p className="font-medium text-foreground mb-6">{submittedEmail}</p>
            <p className="text-xs text-muted-foreground">
              Didn't receive it?{' '}
              <button onClick={() => setSubmitted(false)} className="text-primary hover:underline">
                Try again
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Forgot password?</h1>
              <p className="text-muted-foreground text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send reset link
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
