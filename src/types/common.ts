export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
  requiresAuth?: boolean;
}

export interface Breadcrumb {
  label: string;
  path?: string;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}
