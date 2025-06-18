"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatWindow } from "@/components/chat-window";
import { ProfileModal } from "@/components/profile-modal";
import { ContactsModal } from "@/components/contacts-modal";
import { SettingsModal } from "@/components/settings-modal";
import { NewConversationModal } from "@/components/new-conversation-modal";
import { SystemInfoPanel } from "@/components/system-info-panel";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { useUserConversations, useCreateConversation } from "@/graphql/hooks";

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

  const { conversations, refetch: refetchConversations } = useUserConversations(
    user?.id || ""
  );
  const { createConversation } = useCreateConversation();

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

  const handleStartChat = async (userId: string) => {
    try {
      const existingConv = conversations.find((conv) =>
        conv.participants.some((p) => p.id === userId)
      );

      if (existingConv) {
        setSelectedConversation(existingConv.id);
      } else if (user) {
        const newConversation = await createConversation({
          participantIds: [user.id, userId],
        });

        if (newConversation) {
          await refetchConversations();
          setSelectedConversation(newConversation.id);
        }
      }

      setIsMobile(true);
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
    }
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
    <main className="flex h-screen bg-gray-100">
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

      <div
        className={`${
          !selectedConversation ? "hidden md:flex" : "flex"
        } flex-1`}
      >
        {selectedConversation ? (
          <ChatWindow
            key={selectedConversation}
            conversationId={selectedConversation}
            onBack={handleBackToList}
            showBackButton={isMobile}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />{" "}
              <h3 className="text-xl font-medium text-gray-900 mb-1">
                LAMG-Messages
              </h3>
              <p className="text-gray-500 mb-4">
                Sélectionnez une conversation pour commencer à discuter
              </p>
              <div className="mt-6">
                <SystemInfoPanel />
              </div>
              <div className="mt-4 text-xs text-gray-400">
                🌐 Connecté à l'infrastructure cloud (Render.com + PostgreSQL +
                Redis)
              </div>
            </div>
          </div>
        )}
      </div>

      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
      {showContacts && (
        <ContactsModal
          isOpen={showContacts}
          onClose={() => setShowContacts(false)}
          onStartChat={handleStartChat}
        />
      )}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showNewConversation && (
        <NewConversationModal
          isOpen={showNewConversation}
          onClose={() => setShowNewConversation(false)}
          onStartChat={handleStartChat}
        />
      )}
    </main>
  );
}
