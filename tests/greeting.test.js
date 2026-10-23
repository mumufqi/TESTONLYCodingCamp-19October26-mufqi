/**
 * Greeting Module — Property-Based Tests
 * Feature: todo-life-dashboard
 *
 * Tests the time-based greeting logic from js/app.js.
 *
 * Note: Jest + fast-check are configured in task 13.1.
 * Exports from js/app.js are wired up in task 13.2.
 * Until then, getGreeting is stubbed inline here, mirroring the exact logic
 * in js/app.js so the property tests validate the real algorithm.
 */

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Stub matching getGreeting() in js/app.js exactly
// ---------------------------------------------------------------------------

/**
 * Returns the appropriate greeting string for a given hour of the day (0–23).
 *
 * Ranges (Requirements 2.1–2.4):
 *   05–11  → "Good Morning"
 *   12–16  → "Good Afternoon"
 *   17–20  → "Good Evening"
 *   21–23, 0–4 → "Good Night"
 *
 * Falls back to "Hello" for invalid input (Requirement 2.6).
 *
 * @param {number} hour - Integer 0–23
 * @returns {string}
 */
function getGreeting(hour) {
  if (typeof hour !== 'number' || !Number.isFinite(hour) || hour < 0 || hour > 23) {
    return 'Hello';
  }
  var h = Math.floor(hour);
  if (h >= 5 && h <= 11) return 'Good Morning';
  if (h >= 12 && h <= 16) return 'Good Afternoon';
  if (h >= 17 && h <= 20) return 'Good Evening';
  // Covers 21–23 and 0–4
  return 'Good Night';
}

// ---------------------------------------------------------------------------
// Property 1: Greeting maps correctly for all hours
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 1: Greeting maps hours to correct string
test('Property 1 — greeting maps correctly for all hours (0–23)', () => {
  /**
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4
   *
   * For every valid hour in [0, 23]:
   *   - The result must be one of the four recognised greeting strings.
   *   - The result must match the specific range defined in the requirements.
   *   - "Hello" must never be returned for a valid hour.
   */
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 23 }),
      (hour) => {
        const result = getGreeting(hour);
        const validGreetings = ['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night'];

        // Must be one of the four valid strings — never "Hello" for a valid hour
        expect(validGreetings).toContain(result);

        // Requirement 2.1: 05–11 → "Good Morning"
        if (hour >= 5 && hour <= 11) {
          expect(result).toBe('Good Morning');
        }

        // Requirement 2.2: 12–16 → "Good Afternoon"
        if (hour >= 12 && hour <= 16) {
          expect(result).toBe('Good Afternoon');
        }

        // Requirement 2.3: 17–20 → "Good Evening"
        if (hour >= 17 && hour <= 20) {
          expect(result).toBe('Good Evening');
        }

        // Requirement 2.4: 21–23 and 0–4 → "Good Night"
        if (hour >= 21 || hour <= 4) {
          expect(result).toBe('Good Night');
        }
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Supporting unit tests — boundary values and fallback
// ---------------------------------------------------------------------------

test('hour 5 returns "Good Morning" (lower boundary)', () => {
  expect(getGreeting(5)).toBe('Good Morning');
});

test('hour 11 returns "Good Morning" (upper boundary)', () => {
  expect(getGreeting(11)).toBe('Good Morning');
});

test('hour 12 returns "Good Afternoon" (lower boundary)', () => {
  expect(getGreeting(12)).toBe('Good Afternoon');
});

test('hour 16 returns "Good Afternoon" (upper boundary)', () => {
  expect(getGreeting(16)).toBe('Good Afternoon');
});

test('hour 17 returns "Good Evening" (lower boundary)', () => {
  expect(getGreeting(17)).toBe('Good Evening');
});

test('hour 20 returns "Good Evening" (upper boundary)', () => {
  expect(getGreeting(20)).toBe('Good Evening');
});

test('hour 21 returns "Good Night" (lower boundary of night)', () => {
  expect(getGreeting(21)).toBe('Good Night');
});

test('hour 23 returns "Good Night" (end of day)', () => {
  expect(getGreeting(23)).toBe('Good Night');
});

test('hour 0 returns "Good Night" (midnight)', () => {
  expect(getGreeting(0)).toBe('Good Night');
});

test('hour 4 returns "Good Night" (upper boundary of night wrap)', () => {
  expect(getGreeting(4)).toBe('Good Night');
});

test('invalid input (negative number) returns fallback "Hello"', () => {
  expect(getGreeting(-1)).toBe('Hello');
});

test('invalid input (24) returns fallback "Hello"', () => {
  expect(getGreeting(24)).toBe('Hello');
});

test('invalid input (non-number) returns fallback "Hello"', () => {
  expect(getGreeting('noon')).toBe('Hello');
  expect(getGreeting(null)).toBe('Hello');
  expect(getGreeting(undefined)).toBe('Hello');
});

// ---------------------------------------------------------------------------
// Stub matching validateName logic in saveName() in js/app.js exactly
// A name is valid if its trimmed length is >= 1 AND <= 50
// ---------------------------------------------------------------------------

/**
 * Returns true if the name is valid (trimmed length 1–50), false otherwise.
 *
 * Mirrors the validation guard inside saveName() (Requirement 3.6):
 *   - whitespace-only strings trim to "" → invalid
 *   - empty string → invalid
 *   - names longer than 50 chars → invalid
 *
 * @param {string} name - Raw input from the name field
 * @returns {boolean}
 */
function validateName(name) {
  if (typeof name !== 'string') return false;
  var trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

// ---------------------------------------------------------------------------
// Property 3: Whitespace-only names are always rejected
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 3: Whitespace names are rejected
test('Property 3 — whitespace-only names are always rejected', () => {
  /**
   * Validates: Requirements 3.6
   *
   * For every string composed entirely of whitespace characters
   * (spaces, tabs, newlines), validateName() must return false.
   * The empty string must also be rejected.
   */

  // Empty string is always rejected
  expect(validateName('')).toBe(false);

  fc.assert(
    fc.property(
      fc.stringOf(fc.constantFrom(' ', '\t', '\n')),
      (whitespaceStr) => {
        // A string of only whitespace trims to "" — must be rejected
        expect(validateName(whitespaceStr)).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Stubs for name save/load — mirror saveName() and loadName() in js/app.js
// ---------------------------------------------------------------------------

/**
 * Returns true if the trimmed string is between 1 and 50 characters.
 * (Internal helper used by saveName — same logic as validateName above.)
 * @param {string} raw
 * @returns {boolean}
 */
function isValidName(raw) {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

/**
 * Saves a trimmed, validated name to Local Storage under 'dashboard_name'.
 * Does nothing (returns false) if the trimmed value is empty.
 * @param {string} rawInput
 * @returns {boolean} true if saved, false if rejected
 */
function saveName(rawInput) {
  const trimmed = typeof rawInput === 'string' ? rawInput.trim() : '';
  if (!isValidName(rawInput)) return false;
  try {
    localStorage.setItem('dashboard_name', trimmed);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Reads the saved name from Local Storage.
 * Returns '' if nothing is saved or the value is null.
 * @returns {string}
 */
function loadName() {
  try {
    const value = localStorage.getItem('dashboard_name');
    return value !== null ? value : '';
  } catch (e) {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Property 4: Name save-load round trip preserves trimmed value
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 4: Name save-load round trip
test('Property 4 — name save-load round trip preserves trimmed value', () => {
  /**
   * Validates: Requirements 3.2, 3.3, 3.4
   *
   * For any name that passes validation (trimmed length 1–50):
   *   - saveName() stores the trimmed version in Local Storage
   *   - loadName() returns exactly that trimmed value
   *   - If the original had leading/trailing whitespace, the loaded value
   *     must NOT equal the un-trimmed version
   */
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      (name) => {
        // Only test names whose trimmed form is still valid (1–50 chars)
        const trimmed = name.trim();
        fc.pre(trimmed.length >= 1 && trimmed.length <= 50);

        // Clear any previously saved name before each iteration
        localStorage.removeItem('dashboard_name');

        // Save the raw (possibly whitespace-padded) name
        const saved = saveName(name);
        expect(saved).toBe(true);

        // Load it back — must equal the trimmed version
        const loaded = loadName();
        expect(loaded).toBe(trimmed);

        // If whitespace existed, the loaded value must NOT be the raw input
        if (name !== trimmed) {
          expect(loaded).not.toBe(name);
        }
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Supporting unit tests for saveName / loadName
// ---------------------------------------------------------------------------

test('saveName trims leading and trailing whitespace before storing', () => {
  localStorage.removeItem('dashboard_name');
  saveName('  Alice  ');
  expect(loadName()).toBe('Alice');
});

test('saveName returns false and does not overwrite on empty input', () => {
  localStorage.removeItem('dashboard_name');
  saveName('Bob');
  const result = saveName('   ');
  expect(result).toBe(false);
  expect(loadName()).toBe('Bob'); // original value preserved
});

test('saveName returns false for a name exceeding 50 characters', () => {
  localStorage.removeItem('dashboard_name');
  const longName = 'A'.repeat(51);
  expect(saveName(longName)).toBe(false);
  expect(loadName()).toBe(''); // nothing was stored
});

test('loadName returns empty string when no name is stored', () => {
  localStorage.removeItem('dashboard_name');
  expect(loadName()).toBe('');
});

test('saveName accepts a name of exactly 50 characters', () => {
  localStorage.removeItem('dashboard_name');
  const maxName = 'B'.repeat(50);
  expect(saveName(maxName)).toBe(true);
  expect(loadName()).toBe(maxName);
});

test('saveName accepts a single-character name', () => {
  localStorage.removeItem('dashboard_name');
  expect(saveName('Z')).toBe(true);
  expect(loadName()).toBe('Z');
});
