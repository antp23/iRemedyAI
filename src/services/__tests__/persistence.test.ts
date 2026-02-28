import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  initDB,
  saveProduct,
  saveProducts,
  getProduct,
  getAllProducts,
  deleteProduct,
  clearAll,
  _resetForTesting,
} from '../persistence';
import { generateSeedProducts } from '../seedData';
import type { DrugProduct } from '@/types';

function makeMiniProduct(id: string, name: string): DrugProduct {
  return {
    id,
    ndc: '0000-0000-00',
    name,
    brandName: name,
    genericName: name,
    labelerName: 'Test',
    manufacturer: 'Test Pharma, USA',
    productType: 'prescription',
    category: 'analgesic',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'Tablet',
    strength: '10',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'Bottle',
    description: `${name} test product`,
    activeIngredients: [{ name, strength: '10', unit: 'mg' }],
    inactiveIngredients: [],
    indications: [],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Room temperature',
    requiresPrescription: false,
    isControlled: false,
    isAvailable: true,
    price: 9.99,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('persistence', () => {
  beforeEach(async () => {
    _resetForTesting();
    await initDB();
    await clearAll();
  });

  describe('initDB', () => {
    it('initializes the database successfully', async () => {
      _resetForTesting();
      const db = await initDB();
      expect(db).not.toBeNull();
    });

    it('returns the same instance on subsequent calls', async () => {
      const db1 = await initDB();
      const db2 = await initDB();
      expect(db1).toBe(db2);
    });
  });

  describe('saveProduct / getProduct', () => {
    it('saves and retrieves a product by ID', async () => {
      const product = makeMiniProduct('test-1', 'TestDrug');
      await saveProduct(product);
      const retrieved = await getProduct('test-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-1');
      expect(retrieved?.name).toBe('TestDrug');
    });

    it('returns undefined for non-existent product', async () => {
      const result = await getProduct('does-not-exist');
      expect(result).toBeUndefined();
    });

    it('overwrites existing product on save with same ID', async () => {
      const product1 = makeMiniProduct('test-1', 'DrugV1');
      await saveProduct(product1);

      const product2 = makeMiniProduct('test-1', 'DrugV2');
      await saveProduct(product2);

      const retrieved = await getProduct('test-1');
      expect(retrieved?.name).toBe('DrugV2');
    });
  });

  describe('saveProducts', () => {
    it('saves multiple products in a batch', async () => {
      const products = [
        makeMiniProduct('batch-1', 'BatchDrug1'),
        makeMiniProduct('batch-2', 'BatchDrug2'),
        makeMiniProduct('batch-3', 'BatchDrug3'),
      ];
      await saveProducts(products);

      const all = await getAllProducts();
      expect(all).toHaveLength(3);
    });

    it('handles empty array', async () => {
      await saveProducts([]);
      const all = await getAllProducts();
      expect(all).toHaveLength(0);
    });
  });

  describe('getAllProducts', () => {
    it('returns all saved products', async () => {
      await saveProduct(makeMiniProduct('p1', 'Drug1'));
      await saveProduct(makeMiniProduct('p2', 'Drug2'));

      const all = await getAllProducts();
      expect(all).toHaveLength(2);
      expect(all.map(p => p.id).sort()).toEqual(['p1', 'p2']);
    });

    it('returns empty array when no products exist', async () => {
      const all = await getAllProducts();
      expect(all).toHaveLength(0);
    });
  });

  describe('deleteProduct', () => {
    it('removes a product by ID', async () => {
      await saveProduct(makeMiniProduct('del-1', 'ToDelete'));
      await deleteProduct('del-1');
      const result = await getProduct('del-1');
      expect(result).toBeUndefined();
    });

    it('does not throw when deleting non-existent product', async () => {
      await expect(deleteProduct('no-such-id')).resolves.not.toThrow();
    });
  });

  describe('clearAll', () => {
    it('removes all products', async () => {
      await saveProduct(makeMiniProduct('c1', 'Drug1'));
      await saveProduct(makeMiniProduct('c2', 'Drug2'));
      await clearAll();
      const all = await getAllProducts();
      expect(all).toHaveLength(0);
    });
  });

  describe('save/get/delete cycle', () => {
    it('performs a full CRUD cycle', async () => {
      const product = makeMiniProduct('crud-1', 'CrudDrug');

      // Create
      await saveProduct(product);
      let retrieved = await getProduct('crud-1');
      expect(retrieved?.name).toBe('CrudDrug');

      // Update
      const updated = { ...product, name: 'UpdatedCrudDrug' };
      await saveProduct(updated);
      retrieved = await getProduct('crud-1');
      expect(retrieved?.name).toBe('UpdatedCrudDrug');

      // Delete
      await deleteProduct('crud-1');
      retrieved = await getProduct('crud-1');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('seed data persistence', () => {
    it('saves and retrieves all seed products', async () => {
      const seeds = generateSeedProducts();
      await saveProducts(seeds);
      const all = await getAllProducts();
      expect(all.length).toBe(seeds.length);
      expect(all.length).toBeGreaterThanOrEqual(30);
    });
  });
});
