import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const ConversationSidebar = ({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            data-testid="sidebar-backdrop"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-72 glass z-50 flex flex-col"
            data-testid="conversation-sidebar"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-gradient-primary" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                Conversations
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
                data-testid="close-sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* New conversation button */}
            <div className="p-4">
              <Button
                onClick={onNewConversation}
                className="w-full gap-2 neon-primary"
                data-testid="new-conversation-btn"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
            
            {/* Conversation list */}
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-2 pb-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-xs mt-1">Start chatting with Anjhelika!</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                        currentConversationId === conv.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => onSelectConversation(conv.id)}
                      data-testid={`conversation-item-${conv.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conv.preview || 'New conversation'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(conv.updated_at || conv.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-destructive"
                        data-testid={`delete-conversation-${conv.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConversationSidebar;
