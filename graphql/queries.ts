import { gql } from "@apollo/client";

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
    messages {
      ...MessageFragment
    }
    lastActivity
    createdAt
    updatedAt
  }
  ${USER_FRAGMENT}
  ${MESSAGE_FRAGMENT}
`;

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
    $senderId: ID!
  ) {
    createMessage(
      createMessageInput: $createMessageInput
      senderId: $senderId
    ) {
      id
      content
      sender {
        id
        username
      }
      conversation {
        id
        title
      }
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const REGISTER = gql`
  mutation Register($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!) {
    loginUser(email: $email) {
      user {
        ...UserFragment
      }
      token
    }
  }
  ${USER_FRAGMENT}
`;

// TODO: À implémenter plus tard - Cette mutation sera activée quand le backend GraphQL
// supportera la mise à jour du profil utilisateur
/*
export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(updateUserInput: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;
*/

// TODO: À implémenter plus tard - Cette mutation sera activée quand le backend GraphQL
// supportera la mise à jour des conversations
/*
export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($input: UpdateConversationInput!) {
    updateConversation(updateConversationInput: $input) {
      ...ConversationFragment
    }
  }
  ${CONVERSATION_FRAGMENT}
`;
*/

// TODO: À implémenter plus tard - Cette mutation sera activée quand le backend GraphQL
// supportera la mise à jour du statut de lecture des messages
/*
export const UPDATE_MESSAGE_READ_STATUS = gql`
  mutation UpdateMessageReadStatus($messageIds: [String!]!, $conversationId: String!) {
    updateMessageReadStatus(messageIds: $messageIds, conversationId: $conversationId) {
      success
      updatedMessages {
        ...MessageFragment
      }
    }
  }
  ${MESSAGE_FRAGMENT}
`;
*/
