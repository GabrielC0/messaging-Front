"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MessageCircle,
  Users,
  MoreVertical,
  Plus,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-provider";
import { useUserConversations, useUser } from "@/graphql/hooks";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatSidebarProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  onShowProfile: () => void;
  onShowSettings: () => void;
  onShowContacts: () => void;
  onNewConversation: () => void;
}

export function ChatSidebar({
  selectedConversation,
  onSelectConversation,
  onShowProfile,
  onShowSettings,
  onShowContacts,
  onNewConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { conversations, loading: loadingConversations } = useUserConversations(
    user?.id || ""
  );

  const filteredConversations = conversations.filter((conv) => {
    // Trouver le participant qui n'est pas l'utilisateur actuel
    const otherParticipant = conv.participants.find((p) => p.id !== user?.id);
    return (
      otherParticipant?.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (conv.title &&
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);

    if (isToday(date)) {
      return format(date, "HH'h'mm");
    } else if (isYesterday(date)) {
      return "Hier";
    } else {
      return format(date, "dd/MM/yyyy", { locale: fr });
    }
  };

  return (
    <div className="w-full md:w-96 bg-white border-r border-blue-100 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        {" "}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              className="h-10 w-10 cursor-pointer"
              onClick={onShowProfile}
            >
              <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-500">
                {user?.username ? user.username[0] : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 cursor-pointer !opacity-100 transition-colors"
              onClick={onShowContacts}
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 cursor-pointer !opacity-100 transition-colors"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-blue-500 border-blue-400 text-white placeholder-blue-200 focus:bg-blue-400"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune conversation trouvée
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            // Trouver le participant qui n'est pas l'utilisateur actuel
            const otherParticipant = conversation.participants.find(
              (p) => p.id !== user?.id
            );

            // Déterminer le nom à afficher (nom du groupe ou de l'autre participant)
            const displayName =
              conversation.title ||
              otherParticipant?.username ||
              "Conversation";
            // Utiliser l'avatar de l'autre participant s'il s'agit d'une conversation à deux
            const displayAvatar =
              otherParticipant?.avatarUrl || "/placeholder.svg";
            // Utiliser la première lettre du nom à afficher
            const avatarFallback = displayName[0] || "C";

            // TODO: À implémenter plus tard - Cette variable sera utilisée quand le backend
            // supportera la mise à jour du statut de lecture des messages
            // const unreadCount = 0;

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`flex items-center p-4 hover:bg-blue-50 cursor-pointer border-b border-blue-50 ${
                  selectedConversation === conversation.id ? "bg-blue-100" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={displayAvatar} className="!opacity-100" />
                    <AvatarFallback className="bg-blue-200 !opacity-100">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  {/* TODO: À implémenter plus tard - Statut en ligne
                    Cette fonctionnalité sera implémentée quand le backend GraphQL
                    supportera la gestion du statut en ligne des utilisateurs */}
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 truncate">
                      {displayName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastActivity)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.messages && conversation.messages.length > 0
                        ? conversation.messages[
                            conversation.messages.length - 1
                          ].content
                        : "Aucun message"}
                    </p>
                    {/* TODO: À implémenter plus tard - Affichage du compteur de messages non lus
                      Cette fonctionnalité sera implémentée quand le backend supportera 
                      la mise à jour du statut de lecture */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
