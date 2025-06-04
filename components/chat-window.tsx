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
import {
  useConversationMessages,
  useCreateMessage,
  useUserConversations,
} from "@/graphql/hooks";
import { format } from "date-fns";
import { Conversation } from "@/graphql/types";

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      try {
        await createMessage(
          {
            content: newMessage.trim(),
            conversationId: conversationId,
          },
          user.id
        );

        // Actualiser les messages après l'envoi
        refetchMessages();
        setNewMessage("");
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "HH:mm");
  };

  // Récupérer l'autre participant de la conversation
  const getOtherParticipant = () => {
    const currentConversation = conversations.find(
      (conv: Conversation) => conv.id === conversationId
    );
    if (!currentConversation) return null;
    return currentConversation.participants.find(
      (participant) => participant.id !== user?.id
    );
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex-1 flex flex-col bg-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-blue-700 p-2 cursor-pointer"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={otherParticipant?.avatarUrl || "/placeholder.svg"}
            />
            <AvatarFallback className="bg-blue-500">
              {otherParticipant?.username ? otherParticipant.username[0] : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {otherParticipant?.username || "Conversation"}
            </h3>
            <p className="text-sm text-blue-200">
              {loadingMessages
                ? "Chargement..."
                : messages.length === 0
                ? "Aucun message"
                : `Dernier message: ${formatMessageTime(
                    messages[messages.length - 1].createdAt
                  )}`}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 cursor-pointer"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 cursor-pointer"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 cursor-pointer"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Démarrez la conversation en envoyant un message
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender.id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-900 border border-blue-100"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div
                    className={`flex items-center justify-end mt-1 space-x-1 ${
                      isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    <span className="text-xs">
                      {formatMessageTime(message.createdAt)}
                    </span>
                    {isOwn && (
                      <div className="flex">
                        <div
                          className={`w-1 h-1 rounded-full ${
                            message.isRead ? "bg-blue-200" : "bg-blue-300"
                          }`}
                        ></div>
                        <div
                          className={`w-1 h-1 rounded-full ml-0.5 ${
                            message.isRead ? "bg-blue-200" : "bg-blue-300"
                          }`}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-blue-100 p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:bg-blue-50 cursor-pointer"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 border-blue-200 focus:border-blue-400 cursor-text"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:bg-blue-50 cursor-pointer"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
