import { describe, it, expect } from 'vitest';
import { generateSeedProducts } from '../seedData';
import type { SeedProduct } from '../seedData';

describe('seedData', () => {
  const products = generateSeedProducts();

  it('generates at least 30 products', () => {
    expect(products.length).toBeGreaterThanOrEqual(30);
  });

  it('all products have dataSource set to SEED', () => {
    for (const product of products) {
      expect(product.dataSource).toBe('SEED');
    }
  });

  it('all products have unique IDs', () => {
    const ids = products.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all products have unique NDC codes', () => {
    const ndcs = products.map(p => p.ndc);
    expect(new Set(ndcs).size).toBe(ndcs.length);
  });

  it('all products have required string fields populated', () => {
    const requiredStringFields: (keyof SeedProduct)[] = [
      'id', 'ndc', 'name', 'brandName', 'genericName', 'labelerName',
      'manufacturer', 'dosageForm', 'strength', 'strengthUnit',
      'packageSize', 'packageType', 'description', 'storageConditions',
      'currency', 'createdAt', 'updatedAt', 'apiCountry', 'fgCountry',
    ];

    for (const product of products) {
      for (const field of requiredStringFields) {
        expect(product[field], `Product ${product.id} missing field ${field}`).toBeTruthy();
      }
    }
  });

  it('all products have productType, category, schedule, and routeOfAdministration', () => {
    for (const product of products) {
      expect(product.productType).toBeTruthy();
      expect(product.category).toBeTruthy();
      expect(product.schedule).toBeTruthy();
      expect(product.routeOfAdministration).toBeTruthy();
    }
  });

  it('all products have at least one active ingredient', () => {
    for (const product of products) {
      expect(product.activeIngredients.length).toBeGreaterThanOrEqual(1);
      for (const ingredient of product.activeIngredients) {
        expect(ingredient.name).toBeTruthy();
        expect(ingredient.strength).toBeTruthy();
        expect(ingredient.unit).toBeTruthy();
      }
    }
  });

  it('all products have numeric price > 0', () => {
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
      expect(typeof product.price).toBe('number');
    }
  });

  it('all products have boolean fields', () => {
    for (const product of products) {
      expect(typeof product.requiresPrescription).toBe('boolean');
      expect(typeof product.isControlled).toBe('boolean');
      expect(typeof product.isAvailable).toBe('boolean');
    }
  });

  it('includes US-made products (high MIA)', () => {
    const usProducts = products.filter(p => p.apiCountry === 'US' && p.fgCountry === 'US');
    expect(usProducts.length).toBeGreaterThanOrEqual(5);
  });

  it('includes India-sourced products (medium MIA)', () => {
    const indiaProducts = products.filter(p => p.apiCountry === 'India');
    expect(indiaProducts.length).toBeGreaterThanOrEqual(5);
  });

  it('includes China-sourced products (low MIA)', () => {
    const chinaProducts = products.filter(p => p.apiCountry === 'China');
    expect(chinaProducts.length).toBeGreaterThanOrEqual(5);
  });

  it('includes Puerto Rico products', () => {
    const prProducts = products.filter(p =>
      p.apiCountry === 'Puerto Rico' || p.fgCountry === 'Puerto Rico'
    );
    expect(prProducts.length).toBeGreaterThanOrEqual(1);
  });

  it('includes mixed-origin products (API from one country, FG from another)', () => {
    const mixed = products.filter(p => p.apiCountry !== p.fgCountry);
    expect(mixed.length).toBeGreaterThanOrEqual(2);
  });

  it('spans multiple therapeutic categories', () => {
    const categories = new Set(products.map(p => p.category));
    expect(categories.size).toBeGreaterThanOrEqual(8);
  });

  it('includes multiple manufacturers', () => {
    const manufacturers = new Set(products.map(p => p.manufacturer));
    expect(manufacturers.size).toBeGreaterThanOrEqual(15);
  });

  it('includes controlled substances', () => {
    const controlled = products.filter(p => p.isControlled);
    expect(controlled.length).toBeGreaterThanOrEqual(1);
  });

  it('includes OTC products', () => {
    const otc = products.filter(p => p.productType === 'otc');
    expect(otc.length).toBeGreaterThanOrEqual(1);
  });

  it('includes unavailable products', () => {
    const unavailable = products.filter(p => !p.isAvailable);
    expect(unavailable.length).toBeGreaterThanOrEqual(1);
  });

  it('is deterministic (same output on repeated calls)', () => {
    const firstCall = generateSeedProducts();
    const secondCall = generateSeedProducts();
    expect(firstCall).toEqual(secondCall);
  });

  it('all products have lotNumber and barcode', () => {
    for (const product of products) {
      expect(product.lotNumber).toBeTruthy();
      expect(product.barcode).toBeTruthy();
    }
  });

  it('all products have fdaApprovalDate', () => {
    for (const product of products) {
      expect(product.fdaApprovalDate).toBeTruthy();
    }
  });
});
