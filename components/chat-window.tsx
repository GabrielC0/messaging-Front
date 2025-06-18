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
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-provider";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  useConversationMessages,
  useMessaging,
  useConversation,
} from "../hooks/use-api";
import { useSocket } from "../hooks/use-socket";
import { useNotifications } from "../hooks/use-notifications";
import { Message, User } from "../graphql/types";

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
  showBackButton?: boolean;
}

function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp);
  return format(date, "HH:mm", { locale: fr });
}

export function ChatWindow({
  conversationId,
  onBack,
  showBackButton,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    data: messagesData,
    loading: loadingMessages,
    refetch: refetchMessages,
  } = useConversationMessages(conversationId);

  const { data: conversationData } = useConversation(conversationId);
  const { sendMessage } = useMessaging();
  const { lastMessage } = useSocket();

  const messages = messagesData?.conversationMessages || [];
  const conversation = conversationData?.conversation;

  // Informer le système global de la conversation actuellement visualisée
  useEffect(() => {
    if (typeof window !== "undefined" && conversationId) {
      // Émettre un événement pour informer du changement de conversation active
      window.dispatchEvent(
        new CustomEvent("activeConversationChanged", {
          detail: { conversationId },
        })
      );

      // Également utiliser la fonction globale si elle existe
      if ((window as any).setActiveConversation) {
        (window as any).setActiveConversation(conversationId);
      }
    }

    // Nettoyer quand le composant se démonte
    return () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("activeConversationChanged", {
            detail: { conversationId: null },
          })
        );

        if ((window as any).setActiveConversation) {
          (window as any).setActiveConversation(null);
        }
      }
    };
  }, [conversationId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (lastMessage && lastMessage.conversationId === conversationId) {
      // Actualiser les messages quand un nouveau message arrive dans cette conversation
      refetchMessages();

      // Note: Les notifications sont maintenant gérées globalement par GlobalNotificationListener
      // Nous n'avons plus besoin de les déclencher ici pour éviter les doublons
    }
  }, [lastMessage, conversationId, refetchMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await sendMessage(
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

  const otherParticipant = conversation.participants.find(
    (p: User) => p.id !== user?.id
  );

  const displayName =
    conversation.title || otherParticipant?.username || "Chat";

  return (
    <div className="flex-1 flex flex-col bg-gray-50 border-l border-gray-200">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center flex-1">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={otherParticipant?.avatarUrl || "/placeholder.svg"}
            />
            <AvatarFallback>
              {otherParticipant?.username?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h2 className="font-medium text-sm text-gray-900">
              {otherParticipant?.username || "Conversation"}
            </h2>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={messagesEndRef}
      >
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2" />
            <p>Aucun message dans cette conversation</p>
            <p className="text-sm text-gray-400 mt-1">
              Commencez par dire bonjour !
            </p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender.id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[70%] break-words ${
                  message.sender.id === user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(message.createdAt), "HH:mm")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
