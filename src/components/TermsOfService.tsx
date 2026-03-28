import React from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-premium-bg p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-premium-surface rounded-[32px] p-8 md:p-12 shadow-xl border border-premium-border"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-premium-muted hover:text-premium-ink mb-8 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-accent-gold/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent-gold" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-premium-muted leading-relaxed">
          <p className="text-premium-ink font-bold">Last Updated: March 28, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-ink">1. Acceptance of Terms</h2>
            <p>By accessing or using CreatorOS, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-ink">2. User Accounts</h2>
            <p>You are responsible for maintaining the security of your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-ink">3. AI-Generated Content</h2>
            <p>CreatorOS provides tools for generating content using artificial intelligence. While you own the content you generate, you acknowledge that AI-generated content may not be unique and that other users may generate similar content. We are not responsible for any copyright or legal issues arising from the content you generate.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-ink">4. Prohibited Uses</h2>
            <p>You may not use CreatorOS for any illegal or unauthorized purpose. You agree not to use the service to generate content that is harmful, offensive, or violates the rights of others.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-ink">5. Subscriptions and Payments</h2>
            <p>Certain features of CreatorOS require a paid subscription. All payments are non-refundable unless otherwise required by law. We reserve the right to change our subscription fees at any time with notice to you.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-ink">6. Termination</h2>
            <p>We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-premium-ink">7. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which CreatorOS operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
