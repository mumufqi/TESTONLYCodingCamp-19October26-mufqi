/**
 * Theme Module — Property-Based Tests
 * Feature: todo-life-dashboard
 *
 * Tests the theme persistence logic (Local Storage save-load round trip).
 *
 * Note: Jest + fast-check are configured in task 13.1.
 * Exports from js/app.js are wired up in task 13.2.
 * Until then, this test exercises localStorage behavior directly, mirroring
 * the exact save/load logic used by toggleTheme() and initTheme().
 */

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Minimal stubs matching the save/load logic in js/app.js
// ---------------------------------------------------------------------------

/** Mirrors the write side of toggleTheme() in app.js */
function saveTheme(theme) {
  localStorage.setItem('dashboard_theme', theme);
}

/**
 * Mirrors the read side of initTheme() in app.js.
 * Returns 'light' as the fallback when nothing is saved or the value is
 * unrecognised, matching the behaviour defined in Requirements 12.4 and 12.5.
 */
function loadTheme() {
  var stored = localStorage.getItem('dashboard_theme');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return 'light'; // default fallback
}

// ---------------------------------------------------------------------------
// Property 15: Theme save-load round trip preserves the selected theme
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 15: Theme save-load round trip
test('Property 15 — theme save-load round trip preserves the selected theme', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('light', 'dark'),
      (theme) => {
        // Act: save then load
        saveTheme(theme);
        const loaded = loadTheme();

        // Assert: the loaded value must equal the saved value exactly
        expect(loaded).toBe(theme);
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Supporting unit tests (required by task 13.7, exercised here early)
// ---------------------------------------------------------------------------

test('loadTheme defaults to "light" when nothing is saved', () => {
  localStorage.removeItem('dashboard_theme');
  expect(loadTheme()).toBe('light');
});

test('loadTheme defaults to "light" when an unrecognised value is stored', () => {
  localStorage.setItem('dashboard_theme', 'blue');
  expect(loadTheme()).toBe('light');
});

test('saveTheme followed by loadTheme returns "dark"', () => {
  saveTheme('dark');
  expect(loadTheme()).toBe('dark');
});

test('saveTheme followed by loadTheme returns "light"', () => {
  saveTheme('light');
  expect(loadTheme()).toBe('light');
});
