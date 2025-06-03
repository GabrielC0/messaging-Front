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
import {
  mockUsers,
  mockConversations,
  mockMessages,
  simulateDelay,
} from "@/lib/mock-data";
import { useState, useEffect } from "react";

// Utilitaire pour déterminer si nous devons utiliser des données fictives
const shouldUseMockData = (error: ApolloError | undefined) => {
  return error?.networkError ? true : false;
};

// Hook pour obtenir tous les utilisateurs
export function useUsers() {
  const { data, loading, error, refetch } =
    useQuery<GetUsersResponse>(GET_USERS);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error fetching users, using mock data:", error);
      setUseMock(shouldUseMockData(error));
    }
  }, [error]);

  // Si nous utilisons des données fictives, simuler un délai pour reproduire
  // l'expérience d'un appel API réel
  useEffect(() => {
    let isMounted = true;

    if (useMock && loading) {
      simulateDelay().then(() => {
        if (isMounted) {
          // Cette ligne n'a pas d'effet direct, mais permet de déclencher
          // un re-render une fois le délai écoulé
          setUseMock(true);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [useMock, loading]);

  return {
    users: useMock ? mockUsers : data?.users || [],
    loading: useMock ? false : loading,
    error: useMock ? undefined : error,
    refetch,
  };
}

// Hook pour obtenir un utilisateur par ID
export function useUser(id: string) {
  const { data, loading, error } = useQuery<GetUserResponse>(GET_USER, {
    variables: { id },
    skip: !id,
  });
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error fetching user, using mock data:", error);
      setUseMock(shouldUseMockData(error));
    }
  }, [error]);

  // Simuler un délai si on utilise des données fictives
  useEffect(() => {
    let isMounted = true;

    if (useMock && loading) {
      simulateDelay().then(() => {
        if (isMounted) {
          setUseMock(true);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [useMock, loading]);

  // Trouver l'utilisateur dans les données fictives
  const mockUser = id ? mockUsers.find((u) => u.id === id) : undefined;

  return {
    user: useMock ? mockUser : data?.user,
    loading: useMock ? false : loading,
    error: useMock ? undefined : error,
  };
}

// Hook pour obtenir les conversations d'un utilisateur
export function useUserConversations(userId: string) {
  const { data, loading, error, refetch } =
    useQuery<GetUserConversationsResponse>(GET_USER_CONVERSATIONS, {
      variables: { userId },
      skip: !userId,
    });
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error fetching conversations, using mock data:", error);
      setUseMock(shouldUseMockData(error));
    }
  }, [error]);

  // Simuler un délai si on utilise des données fictives
  useEffect(() => {
    let isMounted = true;

    if (useMock && loading) {
      simulateDelay().then(() => {
        if (isMounted) {
          setUseMock(true);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [useMock, loading]);

  // Filtrer les conversations dans les données fictives pour l'utilisateur spécifié
  const userMockConversations = userId
    ? mockConversations.filter((conv) =>
        conv.participants.some((p) => p.id === userId)
      )
    : [];

  return {
    conversations: useMock
      ? userMockConversations
      : data?.userConversations || [],
    loading: useMock ? false : loading,
    error: useMock ? undefined : error,
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
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error fetching messages, using mock data:", error);
      setUseMock(shouldUseMockData(error));
    }
  }, [error]);

  // Simuler un délai si on utilise des données fictives
  useEffect(() => {
    let isMounted = true;

    if (useMock && loading) {
      simulateDelay().then(() => {
        if (isMounted) {
          setUseMock(true);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [useMock, loading]);

  // Filtrer les messages dans les données fictives pour la conversation spécifiée
  const conversationMockMessages = conversationId
    ? mockMessages.filter((msg) => msg.conversation.id === conversationId)
    : [];

  return {
    messages: useMock
      ? conversationMockMessages
      : data?.conversationMessages || [],
    loading: useMock ? false : loading,
    error: useMock ? undefined : error,
    refetch,
  };
}

// Hook pour créer un utilisateur
export function useCreateUser() {
  const [createUserMutation, { loading, error }] = useMutation<
    CreateUserResponse,
    { createUserInput: CreateUserInput }
  >(CREATE_USER);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error during mutation, using mock data:", error);
      setUseMock(shouldUseMockData(error));
    }
  }, [error]);

  const createUser = async (input: CreateUserInput): Promise<User | null> => {
    if (useMock) {
      // Simuler un délai
      await simulateDelay();

      // Créer un nouvel utilisateur fictif
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: input.username,
        email:
          input.email ||
          `${input.username.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        avatarUrl: input.avatarUrl || "/placeholder.svg",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ajouter l'utilisateur aux données fictives
      mockUsers.push(newUser);

      return newUser;
    }

    try {
      const response = await createUserMutation({
        variables: { createUserInput: input },
      });
      return response.data?.createUser || null;
    } catch (err) {
      console.error("Error creating user:", err);
      setUseMock(shouldUseMockData(err as ApolloError));
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
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error during mutation, using mock data:", error);
      setUseMock(shouldUseMockData(error));
    }
  }, [error]);

  const createConversation = async (
    input: CreateConversationInput
  ): Promise<Conversation | null> => {
    if (useMock) {
      // Simuler un délai
      await simulateDelay();

      // Trouver les participants dans les données fictives
      const participants = input.participantIds
        .map((id) => mockUsers.find((u) => u.id === id))
        .filter((u) => u !== undefined) as User[];

      // Créer une nouvelle conversation fictive
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: input.title,
        participants,
        messages: [],
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ajouter la conversation aux données fictives
      mockConversations.push(newConversation);

      return newConversation;
    }

    try {
      const response = await createConversationMutation({
        variables: { createConversationInput: input },
      });
      return response.data?.createConversation || null;
    } catch (err) {
      console.error("Error creating conversation:", err);
      setUseMock(shouldUseMockData(err as ApolloError));
      return null;
    }
  };

  return { createConversation, loading, error };
}

// Hook pour créer un message
export function useCreateMessage() {
  const [createMessageMutation, { loading, error }] = useMutation<
    CreateMessageResponse,
    { createMessageInput: CreateMessageInput; senderId: string }
  >(CREATE_MESSAGE);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (error) {
      console.warn("Error during mutation, using mock data:", error);
      setUseMock(shouldUseMockData(error));
    }
  }, [error]);

  const createMessage = async (
    input: CreateMessageInput,
    senderId: string
  ): Promise<Message | null> => {
    if (useMock) {
      // Simuler un délai
      await simulateDelay();

      // Trouver l'expéditeur et la conversation dans les données fictives
      const sender = mockUsers.find((u) => u.id === senderId);
      const conversation = mockConversations.find(
        (c) => c.id === input.conversationId
      );

      if (!sender || !conversation) return null;

      // Créer un nouveau message fictif
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content: input.content,
        sender,
        conversation,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ajouter le message aux données fictives
      mockMessages.push(newMessage);

      // Mettre à jour la conversation
      if (conversation.messages) {
        conversation.messages.push(newMessage);
      } else {
        conversation.messages = [newMessage];
      }
      conversation.lastActivity = newMessage.createdAt;
      conversation.updatedAt = newMessage.createdAt;

      return newMessage;
    }

    try {
      const response = await createMessageMutation({
        variables: { createMessageInput: input, senderId },
      });
      return response.data?.createMessage || null;
    } catch (err) {
      console.error("Error creating message:", err);
      setUseMock(shouldUseMockData(err as ApolloError));
      return null;
    }
  };

  return { createMessage, loading, error };
}
