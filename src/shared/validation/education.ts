/* ---------- Year bounds ---------- */
export const MIN_YEAR = 1950;
export const MAX_YEAR = new Date().getFullYear() + 10;

/* ---------- Validators ---------- */

export function validateYear(year: number, label = 'Year'): string | null {
  if (!Number.isInteger(year)) {
    return `${label} must be a valid number`;
  }

  if (year < MIN_YEAR || year > MAX_YEAR) {
    return `${label} must be between ${MIN_YEAR} and ${MAX_YEAR}`;
  }

  return null;
}

export function validatePercentage(value: number): string | null {
  if (Number.isNaN(value)) {
    return 'Percentage must be a number';
  }

  if (value < 0 || value > 100) {
    return 'Percentage must be between 0 and 100';
  }

  return null;
}

export function validateCGPA(value: number): string | null {
  if (Number.isNaN(value)) {
    return 'CGPA must be a number';
  }

  if (value < 0 || value > 10) {
    return 'CGPA must be between 0 and 10';
  }

  return null;
}

export function validateRequiredText(
  value: string | undefined | null,
  label: string,
  maxLength = 100
): string | null {
  if (!value || !value.trim()) {
    return `${label} is required`;
  }

  if (value.trim().length > maxLength) {
    return `${label} must be less than ${maxLength} characters`;
  }

  return null;
}
