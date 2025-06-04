"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatWindow } from "@/components/chat-window";
import { ProfileModal } from "@/components/profile-modal";
import { ContactsModal } from "@/components/contacts-modal";
import { SettingsModal } from "@/components/settings-modal";
import { NewConversationModal } from "@/components/new-conversation-modal";
import { conversations, createNewConversation } from "@/data/chat-data";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";

export default function ChatApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setIsMobile(true);
  };

  const handleBackToList = () => {
    setIsMobile(false);
    setSelectedConversation(null);
  };

  const handleStartChat = (userId: string) => {
    const existingConv = conversations.find(
      (conv) =>
        conv.participants.includes(userId) &&
        conv.participants.includes(user?.id || "user-1")
    );

    if (existingConv) {
      setSelectedConversation(existingConv.id);
    } else {
      const newConversation = createNewConversation(
        user?.id || "user-1",
        userId
      );
      setSelectedConversation(newConversation.id);
    }
    setIsMobile(true);
  };

  const handleNewConversation = () => {
    setShowNewConversation(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div
        className={`${
          isMobile && selectedConversation ? "hidden md:flex" : "flex"
        } flex-col`}
      >
        <ChatSidebar
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onShowProfile={() => setShowProfile(true)}
          onShowSettings={() => setShowSettings(true)}
          onShowContacts={() => setShowContacts(true)}
          onNewConversation={() => setShowNewConversation(true)}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`${
          !selectedConversation ? "hidden md:flex" : "flex"
        } flex-1`}
      >
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            onBack={handleBackToList}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-blue-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bienvenue dans votre chat
              </h3>
              <p className="text-gray-600">
                Sélectionnez une conversation pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <ContactsModal
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
        onStartChat={handleStartChat}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onStartChat={handleStartChat}
      />
    </div>
  );
}
