export const APP_NAME = 'iRemedy AI';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SYMPTOMS: '/symptoms',
  APPOINTMENTS: '/appointments',
  PROFILE: '/profile',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const COLORS = {
  NAVY: '#0A1628',
  GOLD: '#C9A227',
  OFF_WHITE: '#F8F9FA',
} as const;
