import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      activePage: 'dashboard',
      searchQuery: '',
      selectedProductId: null,
      modalState: { isOpen: false, modalId: null },
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useUIStore.getState();
      expect(state.sidebarCollapsed).toBe(false);
      expect(state.activePage).toBe('dashboard');
      expect(state.searchQuery).toBe('');
      expect(state.selectedProductId).toBeNull();
      expect(state.modalState.isOpen).toBe(false);
      expect(state.modalState.modalId).toBeNull();
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar from collapsed to expanded', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);

      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('setSidebarCollapsed', () => {
    it('should set sidebar collapsed state directly', () => {
      useUIStore.getState().setSidebarCollapsed(true);
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);

      useUIStore.getState().setSidebarCollapsed(false);
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('setActivePage', () => {
    it('should update the active page', () => {
      useUIStore.getState().setActivePage('products');
      expect(useUIStore.getState().activePage).toBe('products');
    });

    it('should allow navigating between pages', () => {
      useUIStore.getState().setActivePage('products');
      useUIStore.getState().setActivePage('scoring');
      useUIStore.getState().setActivePage('dashboard');

      expect(useUIStore.getState().activePage).toBe('dashboard');
    });
  });

  describe('setSearchQuery', () => {
    it('should update the search query', () => {
      useUIStore.getState().setSearchQuery('aspirin');
      expect(useUIStore.getState().searchQuery).toBe('aspirin');
    });

    it('should allow clearing the search query', () => {
      useUIStore.getState().setSearchQuery('test');
      useUIStore.getState().setSearchQuery('');
      expect(useUIStore.getState().searchQuery).toBe('');
    });
  });

  describe('selectProduct', () => {
    it('should set the selected product id', () => {
      useUIStore.getState().selectProduct('prod-123');
      expect(useUIStore.getState().selectedProductId).toBe('prod-123');
    });

    it('should allow deselecting a product', () => {
      useUIStore.getState().selectProduct('prod-123');
      useUIStore.getState().selectProduct(null);
      expect(useUIStore.getState().selectedProductId).toBeNull();
    });
  });

  describe('modal state', () => {
    it('should open a modal with id', () => {
      useUIStore.getState().openModal('confirm-delete');

      const { modalState } = useUIStore.getState();
      expect(modalState.isOpen).toBe(true);
      expect(modalState.modalId).toBe('confirm-delete');
    });

    it('should open a modal with data', () => {
      useUIStore.getState().openModal('product-details', { productId: 'prod-1' });

      const { modalState } = useUIStore.getState();
      expect(modalState.isOpen).toBe(true);
      expect(modalState.data).toEqual({ productId: 'prod-1' });
    });

    it('should close a modal', () => {
      useUIStore.getState().openModal('confirm-delete');
      useUIStore.getState().closeModal();

      const { modalState } = useUIStore.getState();
      expect(modalState.isOpen).toBe(false);
      expect(modalState.modalId).toBeNull();
    });
  });
});
