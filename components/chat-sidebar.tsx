"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useUserConversations } from "../hooks/use-api";
import { useWebSocketAdvanced } from "../hooks/use-websocket-advanced";
import { User, Conversation } from "../graphql/types";
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
  const [lastMessageUpdate, setLastMessageUpdate] = useState(0); // Pour forcer le re-tri
  const { user, logout } = useAuth();
  const {
    data: conversationsData,
    loading: loadingConversations,
    error,
    refetch: refetchConversations,
  } = useUserConversations(user?.id || "");

  // Écouter les nouveaux messages WebSocket
  const { lastMessage } = useWebSocketAdvanced({
    autoConnect: true,
  });

  const conversations = conversationsData?.userConversations || [];

  // Debug: Afficher les données reçues
  useEffect(() => {
    console.log("Sidebar - Conversations data:", conversationsData);
    console.log("Sidebar - User ID:", user?.id);
    console.log("Sidebar - Loading:", loadingConversations);
    console.log("Sidebar - Error:", error);
    console.log("Sidebar - Conversations array:", conversations);
  }, [conversationsData, user?.id, loadingConversations, error, conversations]);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv: Conversation) => {
        const otherParticipant = conv.participants.find(
          (p: User) => p.id !== user?.id
        );
        return (
          otherParticipant?.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (conv.title &&
            conv.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .sort((a: Conversation, b: Conversation) => {
        // Trier par date du dernier message (plus récent en premier)
        // lastMessageUpdate est utilisé pour forcer le re-calcul
        const lastMessageA =
          a.messages && a.messages.length > 0
            ? a.messages[a.messages.length - 1]
            : null;
        const lastMessageB =
          b.messages && b.messages.length > 0
            ? b.messages[b.messages.length - 1]
            : null;

        // Si une conversation n'a pas de messages, elle va en bas
        if (!lastMessageA && !lastMessageB) return 0;
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;

        const dateA = new Date(lastMessageA.createdAt);
        const dateB = new Date(lastMessageB.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [conversations, searchQuery, user?.id, lastMessageUpdate]);

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

  // Écouter les nouveaux messages et forcer la mise à jour
  useEffect(() => {
    if (lastMessage) {
      console.log("Sidebar - Nouveau message reçu:", lastMessage);
      // Forcer la mise à jour du tri en mettant à jour le timestamp
      setLastMessageUpdate(Date.now());

      // Optionnel: Recharger les conversations pour avoir les données à jour
      if (refetchConversations) {
        setTimeout(() => {
          refetchConversations();
        }, 500); // Petit délai pour laisser le backend se mettre à jour
      }
    }
  }, [lastMessage, refetchConversations]);

  return (
    <div className="w-full md:w-80 lg:w-96 max-w-sm bg-white flex flex-col h-full shrink-0">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 cursor-pointer" onClick={onShowProfile}>
              <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-500">
                {user?.username ? user.username[0] : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm truncate max-w-[120px]">
              {user?.username}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 cursor-pointer !opacity-100 transition-colors h-8 w-8 p-0"
              onClick={onShowContacts}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 cursor-pointer !opacity-100 transition-colors h-8 w-8 p-0"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 py-1 h-8 text-sm bg-blue-500 border-blue-400 text-white placeholder-blue-200 focus:bg-blue-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-r border-gray-200">
        {loadingConversations ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mb-2 mx-auto text-gray-400" />
            <p>
              {searchQuery
                ? "Aucune conversation trouvée pour cette recherche"
                : "Aucune conversation"}
            </p>
            {!searchQuery && (
              <p className="text-xs mt-1 text-gray-400">
                Commencez une nouvelle conversation
              </p>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation: Conversation) => {
            const otherParticipant = conversation.participants.find(
              (p: User) => p.id !== user?.id
            );
            const displayName =
              conversation.title ||
              otherParticipant?.username ||
              "Conversation";
            const displayAvatar =
              otherParticipant?.avatarUrl || "/placeholder.svg";
            const avatarFallback = displayName[0] || "C";

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                  selectedConversation === conversation.id
                    ? "bg-blue-50 hover:bg-blue-50"
                    : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={displayAvatar} className="!opacity-100" />
                    <AvatarFallback className="bg-blue-100 !opacity-100">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm text-gray-900 truncate max-w-[150px]">
                      {displayName}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {formatTime(conversation.lastActivity)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {conversation.messages && conversation.messages.length > 0
                        ? (() => {
                            const lastMessage =
                              conversation.messages[
                                conversation.messages.length - 1
                              ];
                            const isFromCurrentUser =
                              lastMessage.sender.id === user?.id;
                            const prefix = isFromCurrentUser ? "Vous: " : "";
                            return `${prefix}${lastMessage.content}`;
                          })()
                        : ""}
                    </p>
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
