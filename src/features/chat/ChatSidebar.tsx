import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatHistory, deleteChat, createChat, renameChat } from '@/services/api';
import { useChatStore } from '@/store';
import { formatRelative, truncate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/common/Toast';
import { ROUTES } from '@/lib/constants';

export function ChatSidebar() {
  const { id: activeChatId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useChatStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChatHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      if (activeChatId === id) navigate(ROUTES.CHAT);
      toast('Chat deleted', 'success');
    },
    onError: () => toast('Failed to delete chat', 'error'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameChat(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setEditingId(null);
    },
    onError: () => toast('Failed to rename chat', 'error'),
  });

  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigate(`/chat/${chat.id}`);
    },
  });

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const filtered = chats.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) {
      renameMutation.mutate({ id, title: editTitle.trim() });
    } else {
      setEditingId(null);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)] transition-all duration-300',
        sidebarOpen ? 'w-72' : 'w-0 overflow-hidden',
      )}
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--border-color)]">
        <span className="text-sm font-semibold text-[var(--text-primary)]">Chat History</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
            title="New chat"
            aria-label="New chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-[var(--border-color)]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            aria-label="Search chat history"
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-[var(--bg-muted)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {isLoading ? (
          <div className="space-y-1 px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <MessageSquare className="h-8 w-8 text-[var(--text-muted)]" />
            <p className="text-xs text-[var(--text-muted)] text-center px-4">
              {search ? 'No chats match your search' : 'No chats yet. Start a new conversation!'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className={cn(
                    'group flex items-start gap-2.5 px-3 py-2.5 mx-1.5 rounded-lg cursor-pointer transition-all duration-150',
                    activeChatId === chat.id
                      ? 'bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium'
                      : 'hover:bg-[var(--bg-muted)] text-[var(--text-secondary)]',
                  )}
                  onClick={() => {
                    if (editingId !== chat.id) navigate(`/chat/${chat.id}`);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/chat/${chat.id}`)}
                  aria-label={`Open chat: ${chat.title}`}
                  aria-current={activeChatId === chat.id ? 'page' : undefined}
                >
                  <MessageSquare
                    className={cn(
                      'h-3.5 w-3.5 mt-0.5 flex-shrink-0',
                      activeChatId === chat.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]',
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    {editingId === chat.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          ref={editInputRef}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(chat.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs bg-[var(--bg-surface)] border border-neutral-400 dark:border-neutral-600 rounded px-1.5 py-0.5 focus:outline-none text-[var(--text-primary)]"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRenameSubmit(chat.id); }}
                          className="text-emerald-500 hover:text-emerald-600"
                          aria-label="Save rename"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          aria-label="Cancel rename"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <p className={cn('text-xs font-medium truncate', activeChatId === chat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-primary)]')}>
                        {chat.title}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {truncate(chat.lastMessage, 45)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {formatRelative(chat.updatedAt)}
                    </p>
                  </div>

                  {/* Actions menu */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Chat options"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        side="right"
                        align="start"
                        sideOffset={4}
                        className="z-50 w-40 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-xl)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu.Item
                          onSelect={() => {
                            setEditingId(chat.id);
                            setEditTitle(chat.title);
                          }}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] cursor-pointer outline-none hover:bg-[var(--bg-muted)] transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          Rename
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-color)]" />
                        <DropdownMenu.Item
                          onSelect={() => deleteMutation.mutate(chat.id)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-500 cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Collapsed sidebar expand button
export function SidebarToggle() {
  const { sidebarOpen, setSidebarOpen } = useChatStore();
  if (sidebarOpen) return null;
  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="absolute left-2 top-3 z-10 p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
      aria-label="Expand sidebar"
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
