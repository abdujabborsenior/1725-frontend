'use client';

import { MessageCircle } from 'lucide-react';
import { ChatShell } from '@/components/chat/chat-shell';

export default function MessagesPage() {
  return (
    <ChatShell>
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-900">
          <MessageCircle className="h-8 w-8 text-accent-400" />
        </div>
        <p className="text-lg font-bold text-brand-900">Suhbatni tanlang</p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Chap tomondan suhbat tanlang yoki hamjamiyatdan yangi odam toping.
        </p>
      </div>
    </ChatShell>
  );
}
