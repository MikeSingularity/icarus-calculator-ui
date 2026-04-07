/**
 * Data types for Icarus recipes and items.
 */

export interface DisplayOperation {
  operation: 'division' | 'multiplication';
  value: number;
}

export interface Item {
  id: string;
  display_name: string;
  tier: string;
  tags: string[];
  recipes?: string[];
  display_operations?: DisplayOperation[];
  unit?: string;
  decay_data?: {
    decay_time: number;
    spoil_time: number;
    spoils_to: string | null;
  };
}

export interface Ingredient {
  id: string;
  count: number;
}

export interface Recipe {
  id: string;
  benches: string[];
  inputs: Ingredient[];
  outputs: Ingredient[];
  tags: string[];
}

export interface GameData {
  features: Record<string, string>;
  generics: Record<string, string[]>;
  items: Record<string, Item>;
  recipes: Record<string, Recipe>;
}
