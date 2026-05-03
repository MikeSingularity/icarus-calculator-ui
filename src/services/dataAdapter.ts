import { GameData, Item, Recipe } from '../types/data';

/**
 * DataAdapter Service
 *
 * Handles fetching, parsing, and indexing game data.
 */
class DataAdapter {
  private data: GameData | null = null;
  private itemIndex: Map<string, Item> = new Map();
  private recipeIndex: Map<string, Recipe> = new Map();

  /**
   * Initializes the data adapter by fetching the minified calculator data.
   */
  async init(): Promise<void> {
    try {
      const dataUrl =
        import.meta.env.VITE_DATA_URL ||
        (import.meta.env.DEV
          ? '/public-dev/icarus_consumables.min.json'
          : 'https://mikesingularity.github.io/icarus-consumables-data/icarus_consumables.min.json');
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`Failed to load game data from ${dataUrl}`);

      this.data = await response.json();
      this.buildIndexes();
    } catch (error) {
      console.error('Data initialization failed:', error);
      throw error;
    }
  }

  getMetadata() {
    return this.data?.metadata;
  }

  private buildIndexes() {
    if (!this.data) return;

    // First, index all recipes
    Object.values(this.data.recipes).forEach((recipe) => {
      // Filter out Quest/Mission items from recipes
      const isBlacklisted = recipe.tags?.some(
        (t) => t === 'FactionMission.Item' || t === 'Item.Quest'
      );
      if (!isBlacklisted) {
        this.recipeIndex.set(recipe.id, recipe);
      }
    });

    // Then, index items and filter their recipe lists to only include non-blacklisted ones
    Object.values(this.data.items).forEach((item) => {
      const validRecipes = (item.recipes || []).filter((rId) => this.recipeIndex.has(rId));
      this.itemIndex.set(item.id, { ...item, recipes: validRecipes });
    });
  }

  getItem(id: string): Item | undefined {
    return this.itemIndex.get(id);
  }

  getRecipe(id: string): Recipe | undefined {
    return this.recipeIndex.get(id);
  }

  /**
   * Returns all items, optionally filtered by tier.
   */
  getAllItems(tierFilter?: string): Item[] {
    const items = Array.from(this.itemIndex.values());
    let filtered = items;
    if (tierFilter) {
      filtered = filtered.filter((i) => String(i.tier).startsWith(tierFilter));
    }
    // Respect blacklist
    return filtered.filter((i) => !this.isBlacklisted(i.id));
  }

  /**
   * Checks if an ID is a generic item category.
   */
  isGeneric(id: string): boolean {
    return !!this.data?.generics[id];
  }

  /**
   * isLeaf
   *
   * Determines if an item should stop recursion.
   * True if it's generic, tagged as RawMaterial, or has no recipes.
   */
  isLeaf(id: string): boolean {
    if (this.isGeneric(id)) return true;

    const item = this.getItem(id);
    if (!item) return true;

    // Consider Raw Materials and Ingots as leaf nodes to stop recursion.
    const isMaterial = item.tags?.some(
      (tag: string) => tag === 'IC.Material.Raw' || tag === 'IC.Material.Ingot'
    );
    if (isMaterial) return true;

    if (!item.recipes || item.recipes.length === 0) return true;

    return false;
  }

  /**
   * isBlacklisted
   */
  isBlacklisted(id: string): boolean {
    const item = this.getItem(id);
    return !!item?.tags?.includes('FieldGuide.BlackList');
  }

  /**
   * Gets the display name for an item or generic.
   */
  getDisplayName(id: string): string {
    if (this.isGeneric(id)) {
      // Format generic names (e.g., any_prime_meat -> Any Prime Meat)
      return id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
    return this.getItem(id)?.display_name || id;
  }
}

export const dataAdapter = new DataAdapter();
