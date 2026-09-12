// In-memory data store (MVP). Replace with PostgreSQL in production.

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  language: string;
  plan: 'free' | 'pro';
  dailyLimit: number;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  platform: 'facebook' | 'reddit' | 'instagram' | 'tiktok' | 'youtube' | 'x' | 'linkedin';
  username: string;
  status: 'connected' | 'disconnected';
  todaySent: number;
  dailyLimit: number;
  connectedAt: string;
}

export interface SearchTask {
  id: string;
  userId: string;
  name: string;
  keywords: string;
  platforms: string[];
  strategy: string;
  targetCount: number;
  status: 'pending' | 'running' | 'completed';
  progress: number;
  discovered: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  taskId: string;
  userId: string;
  platform: string;
  username: string;
  profileUrl: string;
  intentScore: number;
  matchReason: string;
  status: 'pending' | 'friend_requested' | 'friend_accepted' | 'messaged' | 'commented' | 'excluded';
  contacted: boolean;
}

export interface MessageRecord {
  id: string;
  leadId: string;
  userId: string;
  platform: string;
  content: string;
  type: 'dm' | 'comment';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
}

export interface UserSettings {
  userId: string;
  deepseekKey: string;
  dailyLimit: number;
}

// In-memory stores
export const users: User[] = [];
export const accounts: ConnectedAccount[] = [];
export const tasks: SearchTask[] = [];
export const leads: Lead[] = [];
export const messages: MessageRecord[] = [];
export const settings: UserSettings[] = [];

export function uid(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function now(): string {
  return new Date().toISOString();
}
