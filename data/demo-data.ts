import { Conversation, Message, User } from "../graphql/types";

export const demoUsers: User[] = [
  {
    id: "demo-user-1",
    username: "Alice Martin",
    email: "alice@demo.com",
    avatarUrl: "/placeholder-user.jpg",
    createdAt: "2024-06-15T10:00:00Z",
    updatedAt: "2024-06-18T15:30:00Z",
  },
  {
    id: "demo-user-2",
    username: "Bob Durand",
    email: "bob@demo.com",
    avatarUrl: "/placeholder-user.jpg",
    createdAt: "2024-06-16T11:00:00Z",
    updatedAt: "2024-06-18T14:20:00Z",
  },
  {
    id: "demo-user-3",
    username: "Claire Moreau",
    email: "claire@demo.com",
    avatarUrl: "/placeholder-user.jpg",
    createdAt: "2024-06-17T09:30:00Z",
    updatedAt: "2024-06-18T16:10:00Z",
  },
];

export const currentDemoUser: User = {
  id: "demo-current-user",
  username: "Utilisateur Demo",
  email: "demo@example.com",
  avatarUrl: "/placeholder-user.jpg",
  createdAt: "2024-06-10T08:00:00Z",
  updatedAt: "2024-06-18T16:15:00Z",
};

// Messages de démonstration
const createDemoMessage = (
  id: string,
  content: string,
  sender: User,
  conversationId: string,
  createdAt: string
): Message => ({
  id,
  content,
  sender,
  conversation: { id: conversationId } as Conversation, // Temporaire, sera mis à jour après
  isRead: true,
  createdAt,
  updatedAt: createdAt,
});

export const demoMessages: Message[] = [
  createDemoMessage(
    "demo-msg-1",
    "Salut ! Comment ça va ?",
    demoUsers[0],
    "demo-conv-1",
    "2024-06-18T10:00:00Z"
  ),
  createDemoMessage(
    "demo-msg-2",
    "Ça va bien ! Et toi ?",
    currentDemoUser,
    "demo-conv-1",
    "2024-06-18T10:05:00Z"
  ),
  createDemoMessage(
    "demo-msg-3",
    "Super ! Tu as vu le nouveau projet ?",
    demoUsers[0],
    "demo-conv-1",
    "2024-06-18T10:10:00Z"
  ),

  createDemoMessage(
    "demo-msg-4",
    "Salut Bob ! Prêt pour la réunion ?",
    currentDemoUser,
    "demo-conv-2",
    "2024-06-18T09:30:00Z"
  ),
  createDemoMessage(
    "demo-msg-5",
    "Oui, j'arrive dans 5 minutes",
    demoUsers[1],
    "demo-conv-2",
    "2024-06-18T09:35:00Z"
  ),

  createDemoMessage(
    "demo-msg-6",
    "Coucou ! Tu es libre ce soir ?",
    demoUsers[2],
    "demo-conv-3",
    "2024-06-18T16:00:00Z"
  ),
  createDemoMessage(
    "demo-msg-7",
    "Désolé, j'ai déjà des plans",
    currentDemoUser,
    "demo-conv-3",
    "2024-06-18T16:05:00Z"
  ),
  createDemoMessage(
    "demo-msg-8",
    "Pas de problème ! Une autre fois 😊",
    demoUsers[2],
    "demo-conv-3",
    "2024-06-18T16:10:00Z"
  ),
];

// Conversations de démonstration
export const demoConversations: Conversation[] = [
  {
    id: "demo-conv-1",
    title: undefined,
    participants: [demoUsers[0]],
    messages: demoMessages.filter(
      (msg) => msg.conversation.id === "demo-conv-1"
    ),
    lastActivity: "2024-06-18T10:10:00Z",
    createdAt: "2024-06-18T10:00:00Z",
    updatedAt: "2024-06-18T10:10:00Z",
  },
  {
    id: "demo-conv-2",
    title: undefined,
    participants: [demoUsers[1]],
    messages: demoMessages.filter(
      (msg) => msg.conversation.id === "demo-conv-2"
    ),
    lastActivity: "2024-06-18T09:35:00Z",
    createdAt: "2024-06-18T09:30:00Z",
    updatedAt: "2024-06-18T09:35:00Z",
  },
  {
    id: "demo-conv-3",
    title: undefined,
    participants: [demoUsers[2]],
    messages: demoMessages.filter(
      (msg) => msg.conversation.id === "demo-conv-3"
    ),
    lastActivity: "2024-06-18T16:10:00Z",
    createdAt: "2024-06-18T16:00:00Z",
    updatedAt: "2024-06-18T16:10:00Z",
  },
];

// Associer les conversations complètes aux messages
demoMessages.forEach((message) => {
  const conv = demoConversations.find((c) => c.id === message.conversation.id);
  if (conv) {
    message.conversation = conv;
  }
});

export const getDemoData = () => ({
  users: demoUsers,
  conversations: demoConversations,
  messages: demoMessages,
  currentUser: currentDemoUser,
});
