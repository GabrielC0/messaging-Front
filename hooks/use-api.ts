"use client";

import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { useSocket } from "./use-socket";
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
} from "../graphql/queries";
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
} from "../graphql/types";

export const useUsers = () => {
  return useQuery<GetUsersResponse>(GET_USERS, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

export const useUser = (id: string) => {
  return useQuery<GetUserResponse>(GET_USER, {
    variables: { id },
    skip: !id,
    errorPolicy: "all",
  });
};

export const useConversations = () => {
  return useQuery<GetConversationsResponse>(GET_CONVERSATIONS, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

export const useConversation = (id: string) => {
  return useQuery<GetConversationResponse>(GET_CONVERSATION, {
    variables: { id },
    skip: !id,
    errorPolicy: "all",
  });
};

export const useUserConversations = (userId: string) => {
  return useQuery<GetUserConversationsResponse>(GET_USER_CONVERSATIONS, {
    variables: { userId },
    skip: !userId,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      console.log("UserConversations data received:", data);
      if (data?.userConversations) {
        console.log("Number of conversations:", data.userConversations.length);
        data.userConversations.forEach((conv, index) => {
          console.log(`Conversation ${index}:`, {
            id: conv.id,
            title: conv.title,
            messagesCount: conv.messages?.length || 0,
            lastMessage:
              conv.messages?.length > 0
                ? conv.messages[conv.messages.length - 1].content
                : "No messages",
          });
        });
      }
    },
    onError: (error) => {
      console.error("Error fetching user conversations:", error);
      console.log(
        "Backend seems unavailable, user will see empty conversations list"
      );
    },
  });
};

export const useMessages = () => {
  return useQuery<GetMessagesResponse>(GET_MESSAGES, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
};

export const useMessage = (id: string) => {
  return useQuery<GetMessageResponse>(GET_MESSAGE, {
    variables: { id },
    skip: !id,
    errorPolicy: "all",
  });
};

export const useConversationMessages = (conversationId: string) => {
  return useQuery<GetConversationMessagesResponse>(GET_CONVERSATION_MESSAGES, {
    variables: { conversationId },
    skip: !conversationId,
    errorPolicy: "all",
    pollInterval: 100,
  });
};

export const useHealthCheck = () => {
  return useQuery<HealthCheckResponse>(HEALTH_CHECK, {
    errorPolicy: "all",
    pollInterval: 30000,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });
};

export const useCreateUser = () => {
  const client = useApolloClient();

  return useMutation(CREATE_USER, {
    onCompleted: () => {
      client.refetchQueries({
        include: [GET_USERS],
      });
    },
    errorPolicy: "all",
  });
};

export const useCreateConversation = () => {
  const client = useApolloClient();

  return useMutation(CREATE_CONVERSATION, {
    onCompleted: () => {
      client.refetchQueries({
        include: [GET_CONVERSATIONS],
      });
    },
    errorPolicy: "all",
  });
};

export const useCreateMessage = () => {
  const client = useApolloClient();
  return useMutation(CREATE_MESSAGE, {
    onCompleted: (data) => {
      if (data?.createMessage?.conversation?.id) {
        client.refetchQueries({
          include: [GET_CONVERSATION_MESSAGES],
        });
      }
    },
    errorPolicy: "all",
  });
};

export const useMessaging = () => {
  const { isConnected, lastMessage } = useSocket();
  const client = useApolloClient();
  const [createMessage] = useCreateMessage();

  const handleNewMessage = (message: Message) => {
    if (message.conversation?.id) {
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
        console.error("Erreur lors de la mise à jour du cache:", error);
      }
    }
  };

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
      console.error("Erreur lors de l'envoi du message:", error);
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

export const useUserOperations = () => {
  const [createUser] = useCreateUser();

  const registerUser = async (input: CreateUserInput) => {
    try {
      const result = await createUser({
        variables: { createUserInput: input },
      });

      return result.data?.createUser;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  };

  return {
    registerUser,
  };
};

export const useConversationOperations = () => {
  const [createConversation] = useCreateConversation();

  const startConversation = async (input: CreateConversationInput) => {
    try {
      const result = await createConversation({
        variables: { createConversationInput: input },
      });

      return result.data?.createConversation;
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      throw error;
    }
  };

  return {
    startConversation,
  };
};
