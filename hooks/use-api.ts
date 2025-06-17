"use client";

import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useSocket } from './use-socket';
import {
  GET_USERS,
  GET_USER,
  GET_CONVERSATIONS,
  GET_CONVERSATION,
  GET_USER_CONVERSATIONS,
  GET_MESSAGES,
  GET_MESSAGE,
  GET_CONVERSATION_MESSAGES,
  HEALTH_CHECK,
  CREATE_USER,
  CREATE_CONVERSATION,
  CREATE_MESSAGE,
} from '../graphql/queries';
import {
  GetUsersResponse,
  GetUserResponse,
  GetConversationsResponse,
  GetConversationResponse,
  GetUserConversationsResponse,
  GetMessagesResponse,
  GetMessageResponse,
  GetConversationMessagesResponse,
  HealthCheckResponse,
  CreateUserInput,
  CreateConversationInput,
  CreateMessageInput,
  User,
  Conversation,
  Message,
} from '../graphql/types';

// Hook pour récupérer tous les utilisateurs
export const useUsers = () => {
  return useQuery<GetUsersResponse>(GET_USERS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

// Hook pour récupérer un utilisateur par ID
export const useUser = (id: string) => {
  return useQuery<GetUserResponse>(GET_USER, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });
};

// Hook pour récupérer toutes les conversations
export const useConversations = () => {
  return useQuery<GetConversationsResponse>(GET_CONVERSATIONS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

// Hook pour récupérer une conversation par ID
export const useConversation = (id: string) => {
  return useQuery<GetConversationResponse>(GET_CONVERSATION, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });
};

// Hook pour récupérer les conversations d'un utilisateur
export const useUserConversations = (userId: string) => {
  return useQuery<GetUserConversationsResponse>(GET_USER_CONVERSATIONS, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
  });
};

// Hook pour récupérer tous les messages
export const useMessages = () => {
  return useQuery<GetMessagesResponse>(GET_MESSAGES, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
};

// Hook pour récupérer un message par ID
export const useMessage = (id: string) => {
  return useQuery<GetMessageResponse>(GET_MESSAGE, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });
};

// Hook pour récupérer les messages d'une conversation
export const useConversationMessages = (conversationId: string) => {
  return useQuery<GetConversationMessagesResponse>(GET_CONVERSATION_MESSAGES, {
    variables: { conversationId },
    skip: !conversationId,
    errorPolicy: 'all',
    pollInterval: 5000, // Refresh toutes les 5 secondes
  });
};

// Hook pour le health check
export const useHealthCheck = () => {
  return useQuery<HealthCheckResponse>(HEALTH_CHECK, {
    errorPolicy: 'all',
    pollInterval: 30000, // Check toutes les 30 secondes
  });
};

// Hook pour créer un utilisateur
export const useCreateUser = () => {
  const client = useApolloClient();
  
  return useMutation(CREATE_USER, {
    onCompleted: () => {
      // Refresh la liste des utilisateurs
      client.refetchQueries({
        include: [GET_USERS],
      });
    },
    errorPolicy: 'all',
  });
};

// Hook pour créer une conversation
export const useCreateConversation = () => {
  const client = useApolloClient();
  
  return useMutation(CREATE_CONVERSATION, {
    onCompleted: () => {
      // Refresh la liste des conversations
      client.refetchQueries({
        include: [GET_CONVERSATIONS],
      });
    },
    errorPolicy: 'all',
  });
};

// Hook pour créer un message
export const useCreateMessage = () => {
  const client = useApolloClient();
    return useMutation(CREATE_MESSAGE, {
    onCompleted: (data) => {
      // Refresh les messages de la conversation
      if (data?.createMessage?.conversation?.id) {
        client.refetchQueries({
          include: [GET_CONVERSATION_MESSAGES],
        });
      }
    },
    errorPolicy: 'all',
  });
};

// Hook combiné pour toutes les opérations de messagerie avec WebSocket
export const useMessaging = () => {
  const { isConnected, lastMessage } = useSocket();
  const client = useApolloClient();
  const [createMessage] = useCreateMessage();

  // Écouter les nouveaux messages via WebSocket et mettre à jour le cache
  const handleNewMessage = (message: Message) => {
    if (message.conversation?.id) {
      // Mettre à jour le cache Apollo avec le nouveau message
      try {
        const existingMessages = client.readQuery({
          query: GET_CONVERSATION_MESSAGES,
          variables: { conversationId: message.conversation.id },
        });

        if (existingMessages) {
          client.writeQuery({
            query: GET_CONVERSATION_MESSAGES,
            variables: { conversationId: message.conversation.id },
            data: {
              conversationMessages: [
                ...existingMessages.conversationMessages,
                message,
              ],
            },
          });
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du cache:', error);
      }
    }
  };

  // Fonction pour envoyer un message
  const sendMessage = async (input: CreateMessageInput, senderId: string) => {
    try {
      const result = await createMessage({
        variables: {
          createMessageInput: input,
          senderId,
        },
      });
      
      return result.data?.createMessage;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  };

  return {
    isConnected,
    lastMessage,
    handleNewMessage,
    sendMessage,
  };
};

// Hook pour les opérations utilisateur
export const useUserOperations = () => {
  const [createUser] = useCreateUser();

  const registerUser = async (input: CreateUserInput) => {
    try {
      const result = await createUser({
        variables: { createUserInput: input },
      });
      
      return result.data?.createUser;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  };

  return {
    registerUser,
  };
};

// Hook pour les opérations de conversation
export const useConversationOperations = () => {
  const [createConversation] = useCreateConversation();

  const startConversation = async (input: CreateConversationInput) => {
    try {
      const result = await createConversation({
        variables: { createConversationInput: input },
      });
      
      return result.data?.createConversation;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  };

  return {
    startConversation,
  };
};
