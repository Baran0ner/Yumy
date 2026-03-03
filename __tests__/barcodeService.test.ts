import { normalizeBarcodeLookupResult } from '../src/services/barcodeService';

describe('barcodeService', () => {
  it('normalizes incomplete payloads safely', () => {
    const result = normalizeBarcodeLookupResult({ found: false });

    expect(result).toEqual({
      found: false,
      productName: '',
      calories: 0,
      macros: {
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
      sourceTitle: 'OpenFoodFacts',
    });
  });

  it('rounds and clamps numeric values', () => {
    const result = normalizeBarcodeLookupResult({
      found: true,
      productName: 'Protein Bar',
      calories: 199.6,
      macros: {
        protein_g: 20.2,
        carbs_g: 15.7,
        fat_g: 6.4,
      },
      sourceTitle: 'OpenFoodFacts',
    });

    expect(result.calories).toBe(200);
    expect(result.macros.protein_g).toBe(20);
    expect(result.macros.carbs_g).toBe(16);
    expect(result.macros.fat_g).toBe(6);
  });
});
