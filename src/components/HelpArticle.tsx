import React from 'react';
import { CaretLeft as ChevronLeft } from '@phosphor-icons/react';

export default function HelpArticle({ topic, onBack }: { topic: string, onBack: () => void }) {
  // Format the topic id to a readable title
  const title = topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="space-y-8 pb-20">
      <div className="pt-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-[17px] text-[var(--accent)] hover:opacity-80 transition-opacity mb-4"
        >
          <ChevronLeft size={20} strokeWidth={2} />
          Help
        </button>
        <h1 className="font-serif text-[36px] font-semibold tracking-[-0.015em] text-[var(--label-primary)] px-1">
          {title}
        </h1>
      </div>

      <section className="bg-[var(--bg-tertiary)] ios-card p-6">
        <p className="text-[17px] leading-relaxed text-[var(--label-secondary)]">
          Documentation for {title} is coming soon. Check back after the next update.
        </p>
      </section>
    </div>
  );
}
