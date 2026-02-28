import { create } from 'zustand';

export interface ModalState {
  isOpen: boolean;
  modalId: string | null;
  data?: Record<string, unknown>;
}

interface UIState {
  sidebarCollapsed: boolean;
  activePage: string;
  searchQuery: string;
  selectedProductId: string | null;
  modalState: ModalState;
}

interface UIActions {
  toggleSidebar(): void;
  setSidebarCollapsed(collapsed: boolean): void;
  setActivePage(page: string): void;
  setSearchQuery(query: string): void;
  selectProduct(productId: string | null): void;
  openModal(modalId: string, data?: Record<string, unknown>): void;
  closeModal(): void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  activePage: 'dashboard',
  searchQuery: '',
  selectedProductId: null,
  modalState: {
    isOpen: false,
    modalId: null,
  },

  toggleSidebar() {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed(collapsed: boolean) {
    set({ sidebarCollapsed: collapsed });
  },

  setActivePage(page: string) {
    set({ activePage: page });
  },

  setSearchQuery(query: string) {
    set({ searchQuery: query });
  },

  selectProduct(productId: string | null) {
    set({ selectedProductId: productId });
  },

  openModal(modalId: string, data?: Record<string, unknown>) {
    set({ modalState: { isOpen: true, modalId, data } });
  },

  closeModal() {
    set({ modalState: { isOpen: false, modalId: null } });
  },
}));
