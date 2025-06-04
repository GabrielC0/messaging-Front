"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-provider";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  useConversationMessages,
  useCreateMessage,
  useUserConversations,
} from "@/graphql/hooks";

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
}

// Fonction utilitaire pour formater le temps des messages
function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp);
  return format(date, "HH:mm", { locale: fr });
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    messages,
    loading: loadingMessages,
    refetch: refetchMessages,
  } = useConversationMessages(conversationId);
  const { createMessage } = useCreateMessage();
  const { conversations } = useUserConversations(user?.id || "");

  // TODO: À implémenter plus tard - Mise à jour du statut de lecture des messages
  // Cette fonctionnalité sera implémentée quand le backend supportera la mise à jour du statut
  // useEffect(() => {
  //   if (messages?.length && user) {
  //     const unreadMessages = messages
  //       .filter(msg => !msg.isRead && msg.sender.id !== user.id)
  //       .map(msg => msg.id);
  //     if (unreadMessages.length > 0) {
  //       updateMessageReadStatus(unreadMessages, conversationId);
  //     }
  //   }
  // }, [messages, conversationId, user]);

  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await createMessage(
        {
          content: newMessage,
          conversationId,
        },
        user.id
      );

      setNewMessage("");
      await refetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Sélectionnez une conversation</p>
      </div>
    );
  }

  // Find the other participant (for direct messages)
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== user?.id
  );

  // Get the display name (group name or participant name)
  const displayName =
    conversation.title || otherParticipant?.username || "Chat";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={otherParticipant?.avatarUrl || "/placeholder.svg"}
          />
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <div className="font-medium">{displayName}</div>
          {/* TODO: À implémenter plus tard - Statut en ligne
            Cette fonctionnalité sera implémentée quand le backend GraphQL
            supportera la gestion du statut en ligne des utilisateurs */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center">
            <p className="text-gray-500">Aucun message</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender.id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="break-words">{message.content}</div>
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <span className="text-xs">
                      {formatMessageTime(message.createdAt)}
                    </span>
                    {/* TODO: À implémenter plus tard - Statut de lecture des messages
                      Ce statut sera ajouté quand le backend supportera cette fonctionnalité */}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex space-x-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
