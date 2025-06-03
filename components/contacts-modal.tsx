"use client";

import { useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
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
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const { user } = useAuth();

  const { users: allUsers, loading: loadingUsers } = useUsers();
  const { conversations } = useUserConversations(user?.id || "");

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter(
    (contact) =>
      contact.id !== user?.id && // Ne pas afficher l'utilisateur actuel
      (contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddContact = () => {
    if (newContactName.trim() && newContactEmail.trim()) {
      // Dans une vraie application, vous feriez une mutation pour ajouter un contact
      setNewContactName("");
      setNewContactEmail("");
      setShowAddContact(false);
    }
  };

  const isInConversation = (userId: string) => {
    return conversations.some((conv) =>
      conv.participants.some((participant) => participant.id === userId)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-medium">Contacts</h2>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddContact(true)}
              className="text-white hover:bg-blue-700 cursor-pointer"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-blue-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-blue-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400 cursor-text"
            />
          </div>
        </div>

        {/* Add Contact Form */}
        {showAddContact && (
          <div className="p-4 border-b border-blue-100 bg-blue-50">
            <h3 className="font-medium mb-3">Ajouter un contact</h3>
            <div className="space-y-2">
              <Input
                placeholder="Nom d'utilisateur"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="border-blue-200 focus:border-blue-400 cursor-text"
              />
              <Input
                placeholder="Email"
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="border-blue-200 focus:border-blue-400 cursor-text"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleAddContact}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Ajouter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Aucun utilisateur trouvé
            </div>
          ) : (
            filteredUsers.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center p-4 hover:bg-blue-50 cursor-pointer border-b border-blue-50"
                onClick={() => {
                  onStartChat(contact.id);
                  onClose();
                }}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-200">
                    {contact.username[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-900">
                    {contact.username}
                  </h3>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {isInConversation(contact.id) ? (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
