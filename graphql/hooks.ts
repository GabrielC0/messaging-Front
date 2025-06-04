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
  LOGIN_USER,
  UPDATE_MESSAGE_READ_STATUS,
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
  LoginMutationResponse,
} from "./types";
import { useState, useEffect } from "react";
import { isBackendAvailable } from "@/lib/apollo-client";

const hasConnectionError = (error: ApolloError | undefined) => {
  if (!isBackendAvailable) {
    return true;
  }

  if (error?.networkError) {
    return true;
  }

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

export function useUsers() {
  const { data, loading, error, refetch } = useQuery<GetUsersResponse>(
    GET_USERS,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    if (error) {
      console.warn("Error fetching users:", error);
      if (hasConnectionError(error)) {
        console.log("Connection error detected");
      }
    }
  }, [error]);

  useEffect(() => {
    if (data?.users) {
      console.log("========= Users from Database =========");
      console.log("Total users:", data.users.length);
      console.table(
        data.users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
        }))
      );
      console.log("=====================================");
    }
  }, [data]);

  const users = data?.users || [];

  return {
    users,
    loading,
    error,
    refetch,
  };
}

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

export function useUserByEmail(email: string) {
  const { data, loading, error, refetch } = useQuery<GetUserByEmailResponse>(
    GET_USER_BY_EMAIL,
    {
      variables: { email },
      skip: !email,
    }
  );

  useEffect(() => {
    if (error) {
      console.warn("Error fetching user by email:", error);
    }
  }, [error]);

  return {
    user: data?.userByEmail || null,
    loading,
    error,
    refetch,
  };
}

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

export function useCreateUser() {
  const [createUserMutation, { loading, error }] = useMutation<
    CreateUserResponse,
    { createUserInput: CreateUserInput }
  >(CREATE_USER);

  const createUser = async (input: CreateUserInput) => {
    try {
      console.log("Attempting to create user with input:", input);
      const response = await createUserMutation({
        variables: { createUserInput: input },
      });

      if (response.data?.createUser) {
        console.log("User successfully created:", response.data.createUser);
        return response.data.createUser;
      } else {
        console.warn("User creation returned no data");
        return null;
      }
    } catch (err) {
      console.error("Error creating user:", err);
      if (err instanceof Error) {
        console.error("Error details:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      }
      return null;
    }
  };

  return { createUser, loading, error };
}

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

export function useCreateMessage() {
  const [createMessageMutation, { loading, error }] = useMutation<
    CreateMessageResponse,
    { createMessageInput: CreateMessageInput; senderId: string }
  >(CREATE_MESSAGE);

  const createMessage = async (input: CreateMessageInput, senderId: string) => {
    try {
      const response = await createMessageMutation({
        variables: {
          createMessageInput: input,
          senderId: senderId,
        },
      });
      return response.data?.createMessage || null;
    } catch (err) {
      console.error("Error creating message:", err);
      return null;
    }
  };

  return { createMessage, loading, error };
}

// TODO: À implémenter plus tard - Hook pour mettre à jour le statut de lecture des messages
// Cette fonctionnalité sera activée quand le backend supportera la mise à jour du statut de lecture
// export function useUpdateMessageReadStatus() {
//   const [updateMessageReadStatusMutation] = useMutation(
//     UPDATE_MESSAGE_READ_STATUS,
//     {
//       refetchQueries: [GET_CONVERSATION_MESSAGES, GET_USER_CONVERSATIONS],
//     }
//   );

//   const updateMessageReadStatus = async (
//     messageIds: string[],
//     conversationId: string
//   ) => {
//     try {
//       await updateMessageReadStatusMutation({
//         variables: {
//           messageIds,
//           conversationId,
//         },
//       });
//     } catch (error) {
//       console.error("Error updating message read status:", error);
//     }
//   };

//   return { updateMessageReadStatus };
// }
