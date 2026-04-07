import { dataAdapter } from '../services/dataAdapter';

/**
 * formatQuantity
 *
 * Formats a raw quantity using the item's display_operations and unit.
 * Logic:
 * 1. Start with the raw count.
 * 2. Apply all display_operations (division/multiplication) in sequence.
 * 3. Append the unit (defaulting to 'x' if none exists).
 */
export function formatQuantity(itemId: string, count: number): string {
  const item = dataAdapter.getItem(itemId);

  // Handling for generic categories which don't have display_operations yet
  if (!item) return `${count}x`;

  let finalCount = count;
  if (item.display_operations) {
    item.display_operations.forEach((op) => {
      if (op.operation === 'division') {
        finalCount /= op.value;
      } else if (op.operation === 'multiplication') {
        finalCount *= op.value;
      }
    });
  }

  // Format to avoid long decimals, showing at most 2 decimal places if needed
  const formattedCount = Number.isInteger(finalCount)
    ? finalCount.toString()
    : parseFloat(finalCount.toFixed(2)).toString();

  const unit = item.unit || 'x';

  // Standard items typically show as "10x"
  if (unit === 'x') {
    return `${formattedCount}x`;
  }

  // Units like 'L', 'kg', 'g' show with a space: "1 L"
  return `${formattedCount} ${unit}`;
}
