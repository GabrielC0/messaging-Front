import { gql } from "@apollo/client";

// Fragments pour réutiliser des parties de requêtes
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    username
    email
    avatarUrl
    createdAt
    updatedAt
  }
`;

export const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on Message {
    id
    content
    sender {
      ...UserFragment
    }
    isRead
    createdAt
    updatedAt
  }
  ${USER_FRAGMENT}
`;

export const CONVERSATION_FRAGMENT = gql`
  fragment ConversationFragment on Conversation {
    id
    title
    participants {
      ...UserFragment
    }
    lastActivity
    createdAt
    updatedAt
  }
  ${USER_FRAGMENT}
`;

// Queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_CONVERSATIONS = gql`
  query GetUserConversations($userId: String!) {
    userConversations(userId: $userId) {
      ...ConversationFragment
    }
  }
  ${CONVERSATION_FRAGMENT}
`;

export const GET_CONVERSATION_MESSAGES = gql`
  query GetConversationMessages($conversationId: String!) {
    conversationMessages(conversationId: $conversationId) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`;

// Mutations
export const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation(
    $createConversationInput: CreateConversationInput!
  ) {
    createConversation(createConversationInput: $createConversationInput) {
      ...ConversationFragment
    }
  }
  ${CONVERSATION_FRAGMENT}
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage(
    $createMessageInput: CreateMessageInput!
    $senderId: String!
  ) {
    createMessage(
      createMessageInput: $createMessageInput
      senderId: $senderId
    ) {
      ...MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`;

export const REGISTER = gql`
  mutation Register($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;
