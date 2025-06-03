"use client";

import { useState } from "react";
import { X, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-provider";
import {
  useUsers,
  useUserConversations,
  useCreateConversation,
} from "@/graphql/hooks";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (conversationId: string) => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onStartChat,
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { users: allUsers, loading: loadingUsers } = useUsers();
  const { conversations, refetch: refetchConversations } = useUserConversations(
    user?.id || ""
  );
  const { createConversation } = useCreateConversation();

  if (!isOpen) return null;

  const availableUsers = allUsers.filter((u) => u.id !== user?.id);
  const filteredUsers = availableUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (selectedUserId: string) => {
    try {
      // Vérifier si une conversation existe déjà avec cet utilisateur
      const existingConversation = conversations.find((conv) =>
        conv.participants.some((p) => p.id === selectedUserId)
      );

      if (existingConversation) {
        // Si une conversation existe déjà, l'utiliser
        onStartChat(existingConversation.id);
      } else {
        // Sinon, créer une nouvelle conversation
        const newConversation = await createConversation({
          participantIds: [user?.id || "", selectedUserId],
        });

        if (newConversation) {
          // Actualiser la liste des conversations
          await refetchConversations();
          // Ouvrir la nouvelle conversation
          onStartChat(newConversation.id);
        }
      }

      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-[70vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-medium">Nouvelle conversation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-blue-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400 cursor-text"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="h-12 w-12 mb-2" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map((otherUser) => {
              // Vérifier si une conversation existe déjà avec cet utilisateur
              const hasConversation = conversations.some((conv) =>
                conv.participants.some((p) => p.id === otherUser.id)
              );

              return (
                <div
                  key={otherUser.id}
                  className="flex items-center p-4 hover:bg-blue-50 cursor-pointer border-b border-blue-50"
                  onClick={() => handleStartChat(otherUser.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={otherUser.avatarUrl || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-blue-200">
                        {otherUser.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status en ligne - à implémenter avec GraphQL */}
                  </div>

                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-gray-900">
                      {otherUser.username}
                    </h3>
                    <p className="text-sm text-gray-600">{otherUser.email}</p>
                    {hasConversation ? (
                      <p className="text-xs text-green-600">
                        💬 Conversation active
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Démarrer une conversation
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
