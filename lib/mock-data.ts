"use client";

import { User, Conversation, Message } from "@/graphql/types";

// Utilisateurs fictifs
export const mockUsers: User[] = [
  {
    id: "user-1",
    username: "Alice Martin",
    email: "alice@example.com",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-2",
    username: "Bob Dupont",
    email: "bob@example.com",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-3",
    username: "Claire Rousseau",
    email: "claire@example.com",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-4",
    username: "David Chen",
    email: "david@example.com",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Messages fictifs
export const mockMessages: Message[] = [
  {
    id: "msg-1",
    content: "Salut ! Comment ça va ?",
    sender: mockUsers[1],
    conversation: { id: "conv-1" } as Conversation,
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-2",
    content: "Très bien, merci ! Et toi ?",
    sender: mockUsers[0],
    conversation: { id: "conv-1" } as Conversation,
    isRead: true,
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-3",
    content: "Je travaille sur un projet intéressant !",
    sender: mockUsers[1],
    conversation: { id: "conv-1" } as Conversation,
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-4",
    content: "Coucou ! Tu as vu le nouveau film ?",
    sender: mockUsers[2],
    conversation: { id: "conv-2" } as Conversation,
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// Conversations fictives
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    title: undefined,
    participants: [mockUsers[0], mockUsers[1]],
    messages: [mockMessages[0], mockMessages[1], mockMessages[2]],
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-2",
    title: undefined,
    participants: [mockUsers[0], mockUsers[2]],
    messages: [mockMessages[3]],
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// Fonction améliorée pour simuler un retard dans les réponses
// avec une variance aléatoire pour rendre les temps de réponse plus réalistes
export const simulateDelay = (baseMs: number = 300) => {
  // Ajouter une variance aléatoire de ±30% pour simuler un comportement plus réaliste
  const variance = baseMs * 0.3;
  const delay = baseMs + (Math.random() * variance * 2 - variance);

  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Fonction pour générer des données fictives supplémentaires à la demande
export const generateMockMessage = (
  conversationId: string,
  senderId: string,
  content: string
): Message => {
  const sender = mockUsers.find((u) => u.id === senderId) || mockUsers[0];

  return {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    content,
    sender,
    conversation: { id: conversationId } as Conversation,
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Fonction pour créer une nouvelle conversation fictive
export const generateMockConversation = (
  participantIds: string[],
  title?: string
): Conversation => {
  const participants = mockUsers.filter((u) => participantIds.includes(u.id));

  return {
    id: `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title || undefined,
    participants,
    messages: [],
    lastActivity: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
