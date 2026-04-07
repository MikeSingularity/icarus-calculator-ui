import { describe, it, expect, vi } from 'vitest';
import { dataAdapter } from '../src/services/dataAdapter';

describe('Smoke Test - tech Stack Support', () => {
  it('should verify vitest is running correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should initialize dataAdapter with mock data', async () => {
    // Mock the global fetch
    const mockData = {
      items: {
        iron_ore: {
          id: 'iron_ore',
          display_name: 'Iron Ore',
          tier: '1',
          tags: ['IC.Material.Raw'],
        },
      },
      recipes: {},
      generics: {},
      features: {},
    };

    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    await dataAdapter.init();
    expect(dataAdapter.getItem('iron_ore')).toBeDefined();
    expect(dataAdapter.getItem('iron_ore')?.display_name).toBe('Iron Ore');
  });
});
