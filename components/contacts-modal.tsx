"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-provider";
import { useUsers, useUserConversations } from "@/graphql/hooks";

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

export function ContactsModal({
  isOpen,
  onClose,
  onStartChat,
}: ContactsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { users: allUsers, loading: loadingUsers, error } = useUsers();
  const { conversations } = useUserConversations(user?.id || "");

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter((contact) => {
    const isCurrentUser = contact.id === user?.id;
    const matchesSearch =
      contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());

    return !isCurrentUser && matchesSearch;
  });

  const isInConversation = (userId: string) => {
    const result = conversations.some((conv) =>
      conv.participants.some((participant) => participant.id === userId)
    );
    return result;
  };

  const handleStartChat = (userId: string) => {
    if (!isInConversation(userId)) {
      onStartChat(userId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-medium">Contacts</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto max-h-96">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Aucun contact trouvé
            </div>
          ) : (
            filteredUsers.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleStartChat(contact.id)}
                className={`flex items-center p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 ${
                  isInConversation(contact.id)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-200">
                    {contact.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">
                    {contact.username}
                  </h3>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
