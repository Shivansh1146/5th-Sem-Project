import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw, Bot } from 'lucide-react';
import { getChat, sendQuery, createChat } from '@/services/api';
import { useChatStore } from '@/store';
import type { Message, QueryFilters } from '@/types';
import { ChatSidebar, SidebarToggle } from '@/features/chat/ChatSidebar';
import { MessageBubble } from '@/features/chat/MessageBubble';
import { InputBar } from '@/features/chat/InputBar';
import { SuggestedQuestions } from '@/features/chat/SuggestedQuestions';
import { SourcePanel } from '@/features/chat/SourcePanel';
import { ChatMessageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorBoundary';
import { useToast } from '@/components/common/Toast';
import { generateId } from '@/lib/utils';

// Streaming typing effect for assistant messages
function useStreamingText(fullText: string, isStreaming: boolean) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(fullText);
      return;
    }
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i += 3; // chars per tick
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [fullText, isStreaming]);
  return displayed;
}

export function ChatPage() {
  const { id: urlChatId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sidebarOpen, sourcePanelOpen } = useChatStore();

  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(urlChatId ?? null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isNew = !urlChatId;

  // Load existing chat
  const { data: chat, isLoading, isError, refetch } = useQuery({
    queryKey: ['chat', urlChatId],
    queryFn: () => getChat(urlChatId!),
    enabled: !!urlChatId,
    staleTime: 30_000,
  });

  // Sync loaded messages into local state
  useEffect(() => {
    if (chat) {
      setLocalMessages(chat.messages);
      setActiveChatId(chat.id);
    }
  }, [chat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, streamingText]);

  const sendMutation = useMutation({
    mutationFn: async ({
      query,
      filters,
      chatId,
    }: {
      query: string;
      filters: QueryFilters;
      chatId: string;
    }) => sendQuery(chatId, query, filters),
    onSuccess: (data) => {
      const streamId = data.assistantMessage.id;
      setStreamingId(streamId);

      // Stream the response
      const full = data.assistantMessage.content;
      let i = 0;
      setStreamingText('');
      const interval = setInterval(() => {
        i += 4;
        setStreamingText(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(interval);
          setStreamingId(null);
          setStreamingText('');
          // Add the final message
          setLocalMessages((prev) => [...prev, data.assistantMessage]);
        }
      }, 16);
    },
    onError: () => {
      toast('Failed to get a response. Please try again.', 'error');
      // Remove the user message that was optimistically added
      setLocalMessages((prev) => prev.slice(0, -1));
    },
  });

  const handleSend = useCallback(
    async (query: string, filters: QueryFilters) => {
      if (sendMutation.isPending) return;

      // Optimistic user message
      const userMsg: Message = {
        id: generateId(),
        chatId: activeChatId ?? 'new',
        role: 'user',
        content: query,
        timestamp: new Date().toISOString(),
      };

      let chatId = activeChatId;

      // Create new chat if needed
      if (!chatId) {
        try {
          const newChat = await createChat();
          chatId = newChat.id;
          setActiveChatId(chatId);
          navigate(`/chat/${chatId}`, { replace: true });
          queryClient.invalidateQueries({ queryKey: ['chats'] });
        } catch {
          toast('Failed to create chat', 'error');
          return;
        }
      }

      setLocalMessages((prev) => [...prev, userMsg]);
      sendMutation.mutate({ query, filters, chatId });
    },
    [activeChatId, sendMutation, navigate, queryClient, toast],
  );

  const handleRegenerate = useCallback(
    (query: string) => {
      if (!activeChatId) return;
      // Remove last assistant message and resend
      setLocalMessages((prev) => {
        const lastUser = [...prev].reverse().find((m) => m.role === 'user');
        return prev.filter((m) => m.role !== 'assistant' || prev.indexOf(m) < prev.lastIndexOf(prev.find((p) => p.role === 'assistant')!));
      });
      sendMutation.mutate({ query, filters: {}, chatId: activeChatId });
    },
    [activeChatId, sendMutation],
  );

  const isPending = sendMutation.isPending;

  // Build display messages (include streaming)
  const displayMessages = streamingId
    ? [
        ...localMessages,
        {
          id: streamingId,
          chatId: activeChatId ?? 'new',
          role: 'assistant' as const,
          content: streamingText,
          isStreaming: true,
          timestamp: new Date().toISOString(),
        },
      ]
    : localMessages;

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Left: Chat Sidebar */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        <ChatSidebar />
      </div>
      <SidebarToggle />

      {/* Center: Chat area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex-shrink-0">
          <div className="h-7 w-7 rounded-lg bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {chat?.title ?? (isNew ? 'New Conversation' : 'Loading…')}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {isPending ? 'Generating answer…' : 'AcadIQ — RAG Academic Assistant'}
            </p>
          </div>
          {isPending && <Loader2 className="h-4 w-4 text-[var(--text-primary)] animate-spin flex-shrink-0" />}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" role="log" aria-label="Chat messages" aria-live="polite">
          {isLoading && urlChatId ? (
            <>
              <ChatMessageSkeleton />
              <ChatMessageSkeleton />
            </>
          ) : isError ? (
            <ErrorState
              message="Failed to load this conversation."
              onRetry={refetch}
            />
          ) : displayMessages.length === 0 ? (
            <SuggestedQuestions onSelect={(q) => handleSend(q, {})} />
          ) : (
            <div className="py-4">
              <AnimatePresence initial={false}>
                {displayMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onRegenerate={
                      msg.role === 'assistant' && !msg.isStreaming
                        ? () => {
                            const lastUser = [...displayMessages].reverse().find((m) => m.role === 'user');
                            if (lastUser) handleRegenerate(lastUser.content);
                          }
                        : undefined
                    }
                  />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isPending && !streamingId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 px-4 py-2"
                >
                  <div className="h-8 w-8 rounded-full bg-black text-white dark:bg-white dark:text-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    AI
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <InputBar
          onSend={handleSend}
          disabled={isPending}
          placeholder={
            isNew
              ? 'Start by asking a question about your university…'
              : 'Ask a follow-up question…'
          }
        />
      </div>

      {/* Right: Source panel */}
      <div className="hidden lg:flex">
        <SourcePanel />
      </div>
    </div>
  );
}
