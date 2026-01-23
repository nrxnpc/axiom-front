export interface LoginParams {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  userType?: string;
}

export interface ApiError {
  status?: number;
  isPermissionError?: boolean;
  body?: {
    error?: string;
    message?: string;
  };
  message?: string;
}

export interface GetTicketsParams {
  limit?: number;
  offset?: number;
  status?: 'open' | 'closed' | 'pending' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'all';
  sort?: 'created_at' | 'updated_at';
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface LastMessage {
  content: string;
  senderRole: 'user' | 'admin' | 'operator';
  timestamp: string | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  createdAt: string | null;
  updatedAt: string | null;
  messageCount: number;
  lastMessage: LastMessage | null;
}

export interface GetTicketsResponse {
  tickets: SupportTicket[];
  pagination: Pagination;
}


export interface CreateTicketRequest {
  userId: string; 
  subject: string;
  priority?: 'low' | 'medium' | 'high';
  content?: string; 
  attachments?: string[];
}

export interface TicketInfo {
  id: string;
  userId: string;
  subject: string;
  status: 'open';
  priority: 'low' | 'medium' | 'high';
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateTicketResponse {
  success: boolean;
  isNew: boolean;
  ticket: TicketInfo;
  message: string;
}

export interface SendMessageRequest {
  content: string;
  attachments?: string[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'operator';
  timestamp: string | null;
  attachments: string[];
}

export interface SendMessageResponse {
  success: boolean;
  message: SupportMessage;
}

export interface GetMessagesParams {
  limit?: number;
  offset?: number;
  since?: string;
  since_id?: string;
}

export interface SupportMessageWithSender {
  id: string;
  ticketId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin' | 'operator';
  timestamp: string | null;
  attachments: string[];
}

export interface GetMessagesResponse {
  messages: SupportMessageWithSender[];
  pagination: Pagination;
}

export type TicketStatus = 'open' | 'closed' | 'pending';
export type TicketPriority = 'low' | 'medium' | 'high';
export type UserRole = 'user' | 'admin' | 'operator' | 'company' | 'superuser';

