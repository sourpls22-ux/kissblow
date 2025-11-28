/**
 * Validates that an ID string represents a valid integer ID
 * @param id - The ID string to validate
 * @returns The validated ID as a number, or null if invalid
 */
export function validateId(id: string): number | null {
  // Check if input is a string
  if (typeof id !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmedId = id.trim();

  // Check if empty
  if (trimmedId.length === 0) {
    return null;
  }

  // Check if contains only digits (optional negative sign)
  if (!/^-?\d+$/.test(trimmedId)) {
    return null;
  }

  // Parse to integer
  const parsedId = parseInt(trimmedId, 10);

  // Check if parsing resulted in NaN
  if (isNaN(parsedId)) {
    return null;
  }

  // Check if the parsed value matches the original string (prevents "123abc" -> 123)
  if (parsedId.toString() !== trimmedId) {
    return null;
  }

  // Check if ID is in valid range (1 to 2147483647 for PostgreSQL INTEGER)
  // Negative IDs are not allowed for database IDs
  if (parsedId < 1 || parsedId > 2147483647) {
    return null;
  }

  return parsedId;
}

/**
 * Validates multiple IDs at once
 * @param ids - Array of ID strings to validate
 * @returns Array of validated IDs, or null if any ID is invalid
 */
export function validateIds(ids: string[]): number[] | null {
  const validatedIds: number[] = [];

  for (const id of ids) {
    const validated = validateId(id);
    if (validated === null) {
      return null;
    }
    validatedIds.push(validated);
  }

  return validatedIds;
}



