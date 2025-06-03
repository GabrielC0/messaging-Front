"use client";

import { useMutation, useQuery, ApolloError } from "@apollo/client";
import {
  GET_USERS,
  GET_USER,
  GET_USER_CONVERSATIONS,
  GET_CONVERSATION_MESSAGES,
  CREATE_USER,
  CREATE_CONVERSATION,
  CREATE_MESSAGE,
} from "./queries";
import {
  User,
  Conversation,
  Message,
  CreateUserInput,
  CreateConversationInput,
  CreateMessageInput,
  GetUsersResponse,
  GetUserResponse,
  GetUserConversationsResponse,
  GetConversationMessagesResponse,
  CreateUserResponse,
  CreateConversationResponse,
  CreateMessageResponse,
} from "./types";
import { useState, useEffect } from "react";
import { isBackendAvailable } from "@/lib/apollo-client";

// Utilitaire amélioré pour déterminer si nous devons utiliser des données fictives
const shouldUseMockData = (error: ApolloError | undefined) => {
  // Si le backend est explicitement marqué comme indisponible
  if (!isBackendAvailable) {
    return true;
  }

  // Si une erreur réseau est présente
  if (error?.networkError) {
    return true;
  }

  // Si une erreur GraphQL indique un problème de connexion ou d'authentification
  if (
    error?.graphQLErrors?.some(
      (err) =>
        err.message.includes("connect") ||
        err.message.includes("network") ||
        err.message.includes("unauthorized") ||
        err.extensions?.code === "UNAUTHENTICATED"
    )
  ) {
    return true;
  }

  return false;
};

// Hook pour obtenir tous les utilisateurs
export function useUsers() {
  const { data, loading, error, refetch } =
    useQuery<GetUsersResponse>(GET_USERS);
  const [useMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error fetching users:", error);
    }
  }, [error]);

  return {
    users: data?.users || [],
    loading,
    error,
    refetch,
  };
}

// Hook pour obtenir un utilisateur spécifique
export function useUser(id: string) {
  const { data, loading, error, refetch } = useQuery<GetUserResponse>(
    GET_USER,
    {
      variables: { id },
    }
  );

  useEffect(() => {
    if (error) {
      console.warn("Error fetching user:", error);
    }
  }, [error]);

  return {
    user: data?.user || null,
    loading,
    error,
    refetch,
  };
}

// Hook pour obtenir les conversations d'un utilisateur
export function useUserConversations(userId: string) {
  const { data, loading, error, refetch } =
    useQuery<GetUserConversationsResponse>(GET_USER_CONVERSATIONS, {
      variables: { userId },
      skip: !userId,
    });

  useEffect(() => {
    if (error) {
      console.warn("Error fetching conversations:", error);
    }
  }, [error]);

  return {
    conversations: data?.userConversations || [],
    loading,
    error,
    refetch,
  };
}

// Hook pour obtenir les messages d'une conversation
export function useConversationMessages(conversationId: string) {
  const { data, loading, error, refetch } =
    useQuery<GetConversationMessagesResponse>(GET_CONVERSATION_MESSAGES, {
      variables: { conversationId },
      skip: !conversationId,
    });

  useEffect(() => {
    if (error) {
      console.warn("Error fetching messages:", error);
    }
  }, [error]);

  return {
    messages: data?.conversationMessages || [],
    loading,
    error,
    refetch,
  };
}

// Hook pour créer un utilisateur
export function useCreateUser() {
  const [createUserMutation, { loading, error }] = useMutation<
    CreateUserResponse,
    { createUserInput: CreateUserInput }
  >(CREATE_USER);

  const createUser = async (input: CreateUserInput) => {
    try {
      const response = await createUserMutation({
        variables: { createUserInput: input },
      });
      return response.data?.createUser || null;
    } catch (err) {
      console.error("Error creating user:", err);
      return null;
    }
  };

  return { createUser, loading, error };
}

// Hook pour créer une conversation
export function useCreateConversation() {
  const [createConversationMutation, { loading, error }] = useMutation<
    CreateConversationResponse,
    { createConversationInput: CreateConversationInput }
  >(CREATE_CONVERSATION);

  const createConversation = async (input: CreateConversationInput) => {
    try {
      const response = await createConversationMutation({
        variables: { createConversationInput: input },
      });
      return response.data?.createConversation || null;
    } catch (err) {
      console.error("Error creating conversation:", err);
      return null;
    }
  };

  return { createConversation, loading, error };
}

// Hook pour créer un message
export function useCreateMessage() {
  const [createMessageMutation, { loading, error }] = useMutation<
    CreateMessageResponse,
    { createMessageInput: CreateMessageInput }
  >(CREATE_MESSAGE);

  const createMessage = async (input: CreateMessageInput) => {
    try {
      const response = await createMessageMutation({
        variables: { createMessageInput: input },
      });
      return response.data?.createMessage || null;
    } catch (err) {
      console.error("Error creating message:", err);
      return null;
    }
  };

  return { createMessage, loading, error };
}
