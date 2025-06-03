export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
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
