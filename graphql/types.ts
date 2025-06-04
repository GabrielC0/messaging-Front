// Types qui correspondent aux modèles GraphQL du backend

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  conversations?: Conversation[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  conversation: Conversation;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageResponse {
  createMessage: {
    id: string;
    content: string;
    sender: {
      id: string;
      username: string;
    };
    conversation: {
      id: string;
      title: string;
    };
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Conversation {
  id: string;
  title?: string;
  participants: User[];
  messages: Message[];
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les inputs des mutations
export interface CreateUserInput {
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface CreateConversationInput {
  title?: string;
  participantIds: string[];
}

export interface CreateMessageInput {
  content: string;
  conversationId: string;
}

// Types pour les résultats des queries
export interface GetUsersResponse {
  users: User[];
}

export interface GetUserResponse {
  user: User;
}

export interface GetUserConversationsResponse {
  userConversations: Conversation[];
}

export interface GetConversationMessagesResponse {
  conversationMessages: Message[];
}

// Types pour les résultats des mutations
export interface CreateUserResponse {
  createUser: User;
}

export interface CreateConversationResponse {
  createConversation: Conversation;
}

export interface CreateMessageResponse {
  createMessage: Message;
}
