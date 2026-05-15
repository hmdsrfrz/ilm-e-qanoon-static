// src/constants/routes.ts

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat/:sessionId',
  SETTINGS: '/settings',
  DOCUMENTS: '/documents',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
