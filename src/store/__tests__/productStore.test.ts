import { describe, it, expect, beforeEach } from 'vitest';
import { useProductStore } from '../productStore';
import type { DrugProduct } from '@/types';

function makeProduct(overrides: Partial<DrugProduct> = {}): DrugProduct {
  return {
    id: 'prod-1',
    ndc: '12345-678-90',
    name: 'Test Drug',
    brandName: 'TestBrand',
    genericName: 'testgeneric',
    labelerName: 'Test Labs USA',
    manufacturer: 'TestPharma Inc',
    productType: 'prescription',
    category: 'analgesic',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'tablet',
    strength: '500',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'bottle',
    description: 'A test drug for unit testing',
    activeIngredients: [{ name: 'Testamine', strength: '500', unit: 'mg' }],
    inactiveIngredients: ['starch'],
    indications: ['pain relief'],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Room temperature',
    requiresPrescription: true,
    isControlled: false,
    isAvailable: true,
    price: 29.99,
    currency: 'USD',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('productStore', () => {
  beforeEach(() => {
    useProductStore.setState({ products: [], isLoaded: false, isLoading: false });
  });

  describe('addProduct', () => {
    it('should add a product to the store', () => {
      const product = makeProduct();
      useProductStore.getState().addProduct(product);

      expect(useProductStore.getState().products).toHaveLength(1);
      expect(useProductStore.getState().products[0]).toEqual(product);
    });

    it('should not add a duplicate product with the same id', () => {
      const product = makeProduct();
      useProductStore.getState().addProduct(product);
      useProductStore.getState().addProduct(product);

      expect(useProductStore.getState().products).toHaveLength(1);
    });

    it('should add multiple products with different ids', () => {
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-1' }));
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-2' }));

      expect(useProductStore.getState().products).toHaveLength(2);
    });
  });

  describe('removeProduct', () => {
    it('should remove a product by id', () => {
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-1' }));
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-2' }));

      useProductStore.getState().removeProduct('prod-1');

      const { products } = useProductStore.getState();
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe('prod-2');
    });

    it('should handle removing non-existent product gracefully', () => {
      useProductStore.getState().addProduct(makeProduct());
      useProductStore.getState().removeProduct('non-existent');

      expect(useProductStore.getState().products).toHaveLength(1);
    });
  });

  describe('updateProduct', () => {
    it('should update a product by id with partial data', () => {
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-1', name: 'Old Name' }));

      useProductStore.getState().updateProduct('prod-1', { name: 'New Name' });

      const product = useProductStore.getState().getProductById('prod-1');
      expect(product?.name).toBe('New Name');
    });

    it('should update the updatedAt timestamp', () => {
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-1' }));

      const before = useProductStore.getState().getProductById('prod-1')?.updatedAt;
      useProductStore.getState().updateProduct('prod-1', { name: 'Updated' });
      const after = useProductStore.getState().getProductById('prod-1')?.updatedAt;

      expect(after).not.toBe(before);
    });

    it('should not modify other products', () => {
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-1', name: 'Product 1' }));
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-2', name: 'Product 2' }));

      useProductStore.getState().updateProduct('prod-1', { name: 'Updated' });

      expect(useProductStore.getState().getProductById('prod-2')?.name).toBe('Product 2');
    });
  });

  describe('getProductById', () => {
    it('should return a product by its id', () => {
      useProductStore.getState().addProduct(makeProduct({ id: 'prod-1', name: 'Target' }));

      const result = useProductStore.getState().getProductById('prod-1');
      expect(result?.name).toBe('Target');
    });

    it('should return undefined for non-existent id', () => {
      const result = useProductStore.getState().getProductById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getProductsByRisk', () => {
    it('should return critical risk products (Schedule I/II)', () => {
      useProductStore.getState().addProduct(makeProduct({ id: '1', schedule: 'I' }));
      useProductStore.getState().addProduct(makeProduct({ id: '2', schedule: 'II' }));
      useProductStore.getState().addProduct(makeProduct({ id: '3', schedule: 'V' }));

      const result = useProductStore.getState().getProductsByRisk('critical');
      expect(result).toHaveLength(2);
    });

    it('should return high risk products (Schedule III)', () => {
      useProductStore.getState().addProduct(makeProduct({ id: '1', schedule: 'III' }));
      useProductStore.getState().addProduct(makeProduct({ id: '2', schedule: 'IV' }));

      const result = useProductStore.getState().getProductsByRisk('high');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return moderate risk products (Schedule IV)', () => {
      useProductStore.getState().addProduct(makeProduct({ id: '1', schedule: 'IV' }));

      const result = useProductStore.getState().getProductsByRisk('moderate');
      expect(result).toHaveLength(1);
    });

    it('should return low risk products (Schedule V/unscheduled)', () => {
      useProductStore.getState().addProduct(makeProduct({ id: '1', schedule: 'V' }));
      useProductStore.getState().addProduct(makeProduct({ id: '2', schedule: 'unscheduled' }));

      const result = useProductStore.getState().getProductsByRisk('low');
      expect(result).toHaveLength(2);
    });
  });

  describe('getProductsByCountry', () => {
    it('should filter products by manufacturer country', () => {
      useProductStore.getState().addProduct(
        makeProduct({ id: '1', manufacturer: 'USA Pharma Corp', labelerName: 'USA Labs' }),
      );
      useProductStore.getState().addProduct(
        makeProduct({ id: '2', manufacturer: 'India Generics Ltd', labelerName: 'India Labs' }),
      );

      const result = useProductStore.getState().getProductsByCountry('USA');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should be case-insensitive', () => {
      useProductStore.getState().addProduct(
        makeProduct({ id: '1', manufacturer: 'Germany Bayer', labelerName: 'Bayer DE' }),
      );

      const result = useProductStore.getState().getProductsByCountry('germany');
      expect(result).toHaveLength(1);
    });

    it('should also search labelerName', () => {
      useProductStore.getState().addProduct(
        makeProduct({ id: '1', manufacturer: 'Generic Pharma', labelerName: 'Canada Health Labs' }),
      );

      const result = useProductStore.getState().getProductsByCountry('Canada');
      expect(result).toHaveLength(1);
    });
  });

  describe('getBAAEligible', () => {
    it('should return products that require prescription and are available', () => {
      useProductStore.getState().addProduct(
        makeProduct({ id: '1', requiresPrescription: true, isAvailable: true }),
      );
      useProductStore.getState().addProduct(
        makeProduct({ id: '2', requiresPrescription: false, isAvailable: true }),
      );
      useProductStore.getState().addProduct(
        makeProduct({ id: '3', requiresPrescription: true, isAvailable: false }),
      );

      const result = useProductStore.getState().getBAAEligible();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getAverageMIA', () => {
    it('should return 0 for no products', () => {
      expect(useProductStore.getState().getAverageMIA()).toBe(0);
    });

    it('should compute average interaction score across products', () => {
      useProductStore.getState().addProduct(
        makeProduct({
          id: '1',
          interactions: [
            { drugName: 'DrugA', severity: 'major', description: 'Serious' },
            { drugName: 'DrugB', severity: 'minor', description: 'Mild' },
          ],
        }),
      );
      useProductStore.getState().addProduct(
        makeProduct({ id: '2', interactions: [] }),
      );

      // Product 1: major(3) + minor(1) = 4, Product 2: 0
      // Average: 4 / 2 = 2
      expect(useProductStore.getState().getAverageMIA()).toBe(2);
    });

    it('should weight severity correctly', () => {
      useProductStore.getState().addProduct(
        makeProduct({
          id: '1',
          interactions: [
            { drugName: 'DrugA', severity: 'contraindicated', description: 'Critical' },
          ],
        }),
      );

      // contraindicated = 4, average = 4/1 = 4
      expect(useProductStore.getState().getAverageMIA()).toBe(4);
    });
  });

  describe('searchProducts', () => {
    beforeEach(() => {
      useProductStore.getState().addProduct(
        makeProduct({ id: '1', name: 'Aspirin', brandName: 'Bayer', genericName: 'acetylsalicylic acid' }),
      );
      useProductStore.getState().addProduct(
        makeProduct({ id: '2', name: 'Lisinopril', brandName: 'Zestril', genericName: 'lisinopril' }),
      );
      useProductStore.getState().addProduct(
        makeProduct({
          id: '3',
          name: 'Amoxicillin',
          brandName: 'Amoxil',
          genericName: 'amoxicillin',
          activeIngredients: [{ name: 'Amoxicillin trihydrate', strength: '500', unit: 'mg' }],
        }),
      );
    });

    it('should search by product name', () => {
      const results = useProductStore.getState().searchProducts('aspirin');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('should search by brand name', () => {
      const results = useProductStore.getState().searchProducts('Zestril');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('should search by generic name', () => {
      const results = useProductStore.getState().searchProducts('lisinopril');
      expect(results).toHaveLength(1);
    });

    it('should search by active ingredient name', () => {
      const results = useProductStore.getState().searchProducts('trihydrate');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
    });

    it('should return all products for empty query', () => {
      const results = useProductStore.getState().searchProducts('');
      expect(results).toHaveLength(3);
    });

    it('should be case-insensitive', () => {
      const results = useProductStore.getState().searchProducts('ASPIRIN');
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', () => {
      const results = useProductStore.getState().searchProducts('zzzzzzz');
      expect(results).toHaveLength(0);
    });
  });
});
