import { ReactNode } from 'react';

export type UserRole = 'admin' | 'freelancer' | 'client';

export interface User {
  role: UserRole;
  name: string;
  email?: string; // Added email for client identification
}

export interface Category {
  id: string;
  label: string;
  icon: ReactNode;
  desc: string;
}

export interface Gig {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  features: string[];
  image: string; // URL string to image source
  status: 'active' | 'inactive';
}

export type OrderStatus = 'pending' | 'in_progress' | 'review' | 'completed';

export interface Order {
  id: string;
  client: string;
  gigId: string | null;
  amount: number;
  status: OrderStatus;
  date: string;
  assignee: string;
  title: string;
  description: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  orderId: string;
  title: string;
  status: TaskStatus;
  due: string;
  priority: TaskPriority;
}

export interface Message {
  id: string;
  sender: 'client' | 'admin' | 'system';
  text: string;
  timestamp: string;
  read: boolean;
}

export type PageView = 'home' | 'marketplace' | 'custom-order' | 'about' | 'portfolio' | 'dashboard';
