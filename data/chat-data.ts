export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: string;
  // TODO: À implémenter plus tard - Ces champs seront activés quand le backend GraphQL
  // supportera la gestion du statut en ligne
  // lastSeen: string;
  // isOnline: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  // TODO: À implémenter plus tard - Ce champ sera activé quand le backend GraphQL
  // supportera la mise à jour du statut de lecture des messages
  // status: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  // TODO: À implémenter plus tard - Ce champ sera activé quand le backend GraphQL
  // supportera la mise à jour du statut de lecture des messages
  // unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isBlocked: boolean;
}
