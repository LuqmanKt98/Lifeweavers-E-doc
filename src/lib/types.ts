
export type UserRole = 'Super Admin' | 'Admin' | 'Clinician';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vocation?: string; // e.g., Physiotherapist, Occupational Therapist
}

export interface Client {
  id: string;
  name: string;
  dateAdded: string; // ISO string
  teamMemberIds?: string[]; // Array of clinician User IDs
  // Other client-specific info can be added here
}

export interface SessionNote {
  id: string;
  clientId: string;
  sessionNumber: number;
  dateOfSession: string; // ISO string
  attendingClinicianId: string;
  attendingClinicianName: string;
  attendingClinicianVocation?: string;
  content: string; // Rich text content / HTML
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // For version history, more fields would be needed
}

// Notifications and Messages Types

export type NotificationType = 'admin_broadcast' | 'system_update' | 'team_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
  recipientUserIds?: string[]; // Undefined or empty for broadcast to all, specific IDs for targeted
  relatedLink?: string; // Optional link, e.g., to a client page or session
}

export type MessageThreadType = 'dm' | 'team_chat';

export interface MessageThread {
  id: string;
  type: MessageThreadType;
  name?: string; // e.g., "Team John Doe Chat" or "DM with Casey Clinician"
  participantIds: string[]; // User IDs
  clientTeamId?: string; // clientId if it's a team_chat
  lastMessageTimestamp: string; // ISO string
  lastMessageSnippet?: string;
  unreadCount: number; // Unread messages for the current user in this thread
  avatarUrl?: string; // For DM or team avatar
  avatarFallback?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderAvatarFallback?: string;
  content: string;
  timestamp: string; // ISO string
  isOwnMessage?: boolean; // Helper for UI rendering
}

// Special Notification for Banners
export interface SpecialNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'promo';
  link?: string;
  // isActive is managed by the component displaying the banner list
}
