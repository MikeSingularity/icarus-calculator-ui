import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatQuantity } from '../src/utils/quantityFormatter';
import { dataAdapter } from '../src/services/dataAdapter';

describe('quantityFormatter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format standard items with x suffix', () => {
    dataAdapter.getItem = vi.fn().mockReturnValue({
      id: 'iron_ore',
      display_name: 'Iron Ore',
      unit: 'x',
    });

    expect(formatQuantity('iron_ore', 10)).toBe('10x');
  });

  it('should apply division display_operation for water', () => {
    dataAdapter.getItem = vi.fn().mockReturnValue({
      id: 'fieldguide_water',
      display_name: 'Water',
      display_operations: [{ operation: 'division', value: 1000 }],
      unit: 'L',
    });

    expect(formatQuantity('fieldguide_water', 1000)).toBe('1 L');
    expect(formatQuantity('fieldguide_water', 500)).toBe('0.5 L');
    expect(formatQuantity('fieldguide_water', 1250)).toBe('1.25 L');
  });

  it('should handle missing units by defaulting to x', () => {
    dataAdapter.getItem = vi.fn().mockReturnValue({
      id: 'wood',
      display_name: 'Wood',
    });

    expect(formatQuantity('wood', 5)).toBe('5x');
  });

  it('should apply multiplication display_operation', () => {
    dataAdapter.getItem = vi.fn().mockReturnValue({
      id: 'test_item',
      display_operations: [{ operation: 'multiplication', value: 2 }],
      unit: 'g',
    });

    expect(formatQuantity('test_item', 5)).toBe('10 g');
  });

  it('should limit decimal places to 2', () => {
    dataAdapter.getItem = vi.fn().mockReturnValue({
      id: 'fieldguide_water',
      display_operations: [{ operation: 'division', value: 3 }],
      unit: 'L',
    });

    // 10 / 3 = 3.3333...
    expect(formatQuantity('fieldguide_water', 10)).toBe('3.33 L');
  });
});
