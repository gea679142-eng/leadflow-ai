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
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'x' | 'linkedin';
  username: string;
  cookies: string;
  status: 'connected' | 'disconnected' | 'risky';
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
  targetCount: number;
  status: 'pending' | 'searching' | 'filtering' | 'completed';
  progress: number;
  discovered: number;
  filtered: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  taskId: string;
  userId: string;
  platform: string;
  username: string;
  profileUrl: string;
  avatar: string;
  intentScore: number;
  matchReason: string;
  followers: number;
  source: string;
  status: 'pending' | 'selected' | 'excluded' | 'messaged';
}

export interface MessageRecord {
  id: string;
  leadId: string;
  userId: string;
  content: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  sentAt?: string;
}

export interface UserSettings {
  userId: string;
  deepseekKey: string;
  dailyLimit: number;
  hourlyLimit: number;
  minInterval: number;
  maxInterval: number;
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
