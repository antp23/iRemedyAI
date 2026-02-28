import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useProductStore } from '@/store';
import { generateSeedProducts } from '@/services/seedData';

const AppShell = () => {
  const isLoaded = useProductStore((s) => s.isLoaded);
  const isLoading = useProductStore((s) => s.isLoading);
  const products = useProductStore((s) => s.products);
  const loadFromPersistence = useProductStore((s) => s.loadFromPersistence);
  const addProduct = useProductStore((s) => s.addProduct);

  // Load persisted products on mount
  useEffect(() => {
    loadFromPersistence();
  }, [loadFromPersistence]);

  // Seed data if store is empty after loading
  useEffect(() => {
    if (isLoaded && !isLoading && products.length === 0) {
      try {
        const seedProducts = generateSeedProducts();
        for (const product of seedProducts) {
          addProduct(product);
        }
      } catch (error) {
        console.warn('Failed to load seed data:', error);
      }
    }
  }, [isLoaded, isLoading, products.length, addProduct]);

  return (
    <div className="flex min-h-screen" data-testid="app-shell">
      <Sidebar />
      <main
        className="flex-1 bg-offWhite"
        style={{ padding: '24px' }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
