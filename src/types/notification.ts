export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export type NotificationType =
  | 'appointment-reminder'
  | 'appointment-confirmation'
  | 'appointment-cancelled'
  | 'prescription-ready'
  | 'prescription-refill'
  | 'lab-results'
  | 'message-received'
  | 'score-updated'
  | 'care-gap-alert'
  | 'system-announcement';

export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationPreferences {
  userId: string;
  channels: ChannelPreferences;
  quietHours: QuietHours;
  categories: Record<NotificationType, boolean>;
}

export interface ChannelPreferences {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}
