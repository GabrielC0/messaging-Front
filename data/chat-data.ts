export interface User {
  id: string
  name: string
  avatar: string
  phone: string
  status: string
  lastSeen: string
  isOnline: boolean
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  type: "text" | "image" | "file"
  status: "sent" | "delivered" | "read"
}

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isGroup: boolean
  groupName?: string
  groupAvatar?: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  avatar: string
  isBlocked: boolean
}

// Utilisateur actuel
export const currentUser: User = {
  id: "user-1",
  name: "Moi",
  avatar: "/placeholder.svg?height=40&width=40",
  phone: "+33 6 12 34 56 78",
  status: "Disponible",
  lastSeen: "En ligne",
  isOnline: true,
}

// Utilisateurs
export const users: User[] = [
  {
    id: "user-2",
    name: "Alice Martin",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+33 6 98 76 54 32",
    status: "Occupée au travail",
    lastSeen: "il y a 5 min",
    isOnline: true,
  },
  {
    id: "user-3",
    name: "Bob Dupont",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+33 6 11 22 33 44",
    status: "En vacances 🏖️",
    lastSeen: "il y a 1h",
    isOnline: false,
  },
  {
    id: "user-4",
    name: "Claire Rousseau",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+33 6 55 66 77 88",
    status: "Disponible",
    lastSeen: "il y a 2 min",
    isOnline: true,
  },
  {
    id: "user-5",
    name: "David Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "+33 6 99 88 77 66",
    status: "Ne pas déranger",
    lastSeen: "il y a 30 min",
    isOnline: false,
  },
]

// Messages
export const messages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-2",
    content: "Salut ! Comment ça va ?",
    timestamp: "2024-01-15T10:30:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-2",
    senderId: "user-1",
    content: "Ça va bien merci ! Et toi ?",
    timestamp: "2024-01-15T10:32:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-3",
    senderId: "user-2",
    content: "Super ! Tu es libre ce soir pour un café ?",
    timestamp: "2024-01-15T10:35:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-4",
    senderId: "user-1",
    content: "Oui avec plaisir ! À quelle heure ?",
    timestamp: "2024-01-15T10:37:00Z",
    type: "text",
    status: "delivered",
  },
  {
    id: "msg-5",
    senderId: "user-3",
    content: "Hey ! Tu as vu le match hier ?",
    timestamp: "2024-01-15T09:15:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-6",
    senderId: "user-1",
    content: "Non j'ai raté ! Qui a gagné ?",
    timestamp: "2024-01-15T09:20:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-7",
    senderId: "user-4",
    content: "Merci pour ton aide aujourd'hui !",
    timestamp: "2024-01-15T14:45:00Z",
    type: "text",
    status: "read",
  },
  {
    id: "msg-8",
    senderId: "user-1",
    content: "De rien, c'était un plaisir !",
    timestamp: "2024-01-15T14:47:00Z",
    type: "text",
    status: "sent",
  },
]

// Conversations
export const conversations: Conversation[] = [
  {
    id: "conv-1",
    participants: ["user-1", "user-2"],
    messages: ["msg-1", "msg-2", "msg-3", "msg-4"],
    lastMessage: "Oui avec plaisir ! À quelle heure ?",
    lastMessageTime: "10:37",
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: "conv-2",
    participants: ["user-1", "user-3"],
    messages: ["msg-5", "msg-6"],
    lastMessage: "Non j'ai raté ! Qui a gagné ?",
    lastMessageTime: "09:20",
    unreadCount: 1,
    isGroup: false,
  },
  {
    id: "conv-3",
    participants: ["user-1", "user-4"],
    messages: ["msg-7", "msg-8"],
    lastMessage: "De rien, c'était un plaisir !",
    lastMessageTime: "14:47",
    unreadCount: 0,
    isGroup: false,
  },
]

// Contacts
export const contacts: Contact[] = [
  {
    id: "user-2",
    name: "Alice Martin",
    phone: "+33 6 98 76 54 32",
    avatar: "/placeholder.svg?height=40&width=40",
    isBlocked: false,
  },
  {
    id: "user-3",
    name: "Bob Dupont",
    phone: "+33 6 11 22 33 44",
    avatar: "/placeholder.svg?height=40&width=40",
    isBlocked: false,
  },
  {
    id: "user-4",
    name: "Claire Rousseau",
    phone: "+33 6 55 66 77 88",
    avatar: "/placeholder.svg?height=40&width=40",
    isBlocked: false,
  },
  {
    id: "user-5",
    name: "David Chen",
    phone: "+33 6 99 88 77 66",
    avatar: "/placeholder.svg?height=40&width=40",
    isBlocked: false,
  },
]

// Modifier l'export des conversations pour permettre la mutation
export const mutableConversations = conversations
export const mutableMessages = messages

// Ajouter cette fonction à la fin du fichier
export function createNewConversation(userId1: string, userId2: string): Conversation {
  const newConversation: Conversation = {
    id: `conv-${Date.now()}`,
    participants: [userId1, userId2],
    messages: [],
    lastMessage: "",
    lastMessageTime: "",
    unreadCount: 0,
    isGroup: false,
  }

  conversations.push(newConversation)
  return newConversation
}

// Ajouter cette fonction pour ajouter un message à une conversation
export function addMessageToConversation(conversationId: string, message: Message): void {
  const conversation = conversations.find((c) => c.id === conversationId)
  if (conversation) {
    conversation.messages.push(message.id)
    conversation.lastMessage = message.content
    conversation.lastMessageTime = new Date(message.timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  messages.push(message)
}
