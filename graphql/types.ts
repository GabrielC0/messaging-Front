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

// TODO: À implémenter plus tard - Ces interfaces seront activées quand le backend GraphQL
// supportera la mise à jour du profil utilisateur
/*
export interface UpdateUserInput {
  userId: string;
  username?: string;
  avatarUrl?: string;
}

export interface UpdateUserResponse {
  updateUser: User;
}
*/

export interface Conversation {
  id: string;
  title?: string;
  participants: User[];
  messages: Message[];
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

// TODO: À implémenter plus tard - Ces interfaces seront activées quand le backend GraphQL
// supportera la mise à jour des conversations
/*
export interface UpdateConversationInput {
  conversationId: string;
  title?: string;
  participantIds?: string[];
}

export interface UpdateConversationResponse {
  updateConversation: Conversation;
}
*/

// Types pour les inputs des mutations
export interface CreateUserInput {
  username: string;
  email: string;
  avatarUrl?: string;
}

// TODO: À implémenter plus tard - Ce type sera activé quand le backend GraphQL
// supportera la mise à jour du profil utilisateur
/*
export interface UpdateUserInput {
  userId: string;
  username?: string;
  avatarUrl?: string;
}

export interface UpdateUserResponse {
  updateUser: User;
}
*/

// TODO: À implémenter plus tard - Ces interfaces seront activées quand le backend GraphQL
// supportera la mise à jour des conversations
/*
export interface UpdateConversationInput {
  conversationId: string;
  title?: string;
  participantIds?: string[];
}

export interface UpdateConversationResponse {
  updateConversation: Conversation;
}
*/

export interface CreateConversationInput {
  title?: string;
  participantIds: string[];
}

export interface CreateMessageInput {
  content: string;
  conversationId: string;
}

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
