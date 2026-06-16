'use client';

import { useParams } from 'next/navigation';
import { ChatShell } from '@/components/chat/chat-shell';
import { ChatWindow } from '@/components/chat/chat-window';

export default function ConversationPage() {
  const params = useParams();
  const id = String(params.id);
  return (
    <ChatShell activeId={id}>
      <ChatWindow key={id} conversationId={id} />
    </ChatShell>
  );
}
