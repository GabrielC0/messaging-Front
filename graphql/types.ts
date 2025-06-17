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

export interface Conversation {
  id: string;
  title?: string;
  participants: User[];
  messages: Message[];
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckResult {
  result: string;
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

// Types pour les réponses GraphQL
export interface GetUsersResponse {
  users: User[];
}

export interface GetUserResponse {
  user: User;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
}

export interface GetConversationResponse {
  conversation: Conversation;
}

export interface GetUserConversationsResponse {
  userConversations: Conversation[];
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface GetMessageResponse {
  message: Message;
}

export interface GetConversationMessagesResponse {
  conversationMessages: Message[];
}

export interface HealthCheckResponse {
  healthCheck: HealthCheckResult;
}

export interface CreateUserResponse {
  createUser: User;
}

export interface CreateConversationResponse {
  createConversation: Conversation;
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

export interface GetUserByEmailResponse {
  userByEmail: User;
}

export interface LoginMutationResponse {
  loginUser: {
    user: User;
    token: string;
  };
}

// TODO: À implémenter plus tard - Ces interfaces seront activées quand le backend GraphQL
// supportera la mise à jour du statut de lecture des messages
/*
export interface UpdateMessageReadStatusInput {
  messageIds: string[];
  conversationId: string;
}

export interface UpdateMessageReadStatusResponse {
  updateMessageReadStatus: {
    success: boolean;
    updatedMessages: Message[];
  };
}
*/
