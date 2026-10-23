/**
 * Task List Module — Property-Based Tests
 * Feature: todo-life-dashboard
 *
 * Tests the task validation and mutation logic from js/app.js.
 *
 * Note: Jest + fast-check are configured in task 13.1.
 * Exports from js/app.js are wired up in task 13.2.
 * Until then, all functions are stubbed inline here, mirroring the exact
 * logic described in js/app.js and the design spec.
 */

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Stubs — mirror the exact implementations in js/app.js
// ---------------------------------------------------------------------------

/**
 * Validates a candidate task name string.
 *
 * Returns `true` if and only if the trimmed input has a length between 1 and
 * 100 characters (inclusive). Returns `false` for null, undefined, empty
 * strings, whitespace-only strings, or strings whose trimmed length exceeds 100.
 *
 * (Requirements 6.2, 6.5, 6.6)
 *
 * @param {*} text - Candidate task name
 * @returns {boolean}
 */
function validateTaskText(text) {
  if (text === null || text === undefined) return false;
  var trimmed = String(text).trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

/**
 * Generates a short, unique-enough ID string for client-side use.
 *
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ---------------------------------------------------------------------------
// In-memory task store — used by addTask / loadTasks / saveTasks stubs.
// This mirrors the Local Storage-backed implementation that will be wired
// up in task 8.4 / 13.2. Tests reset this store between runs.
// ---------------------------------------------------------------------------

var _taskStore = [];

function loadTasks() {
  return _taskStore.slice(); // return a copy
}

function saveTasks(tasks) {
  _taskStore = tasks.slice();
}

/**
 * Validates `text`, then pushes a new { id, text, completed: false } object
 * to the task store.  Returns `true` on success, `false` if validation fails.
 *
 * Mirrors addTask() from app.js (task 8.4).
 *
 * @param {string} text - Raw task name
 * @returns {boolean}
 */
function addTask(text) {
  if (!validateTaskText(text)) return false;
  var trimmed = String(text).trim();
  var tasks = loadTasks();
  tasks.push({ id: generateId(), text: trimmed, completed: false });
  saveTasks(tasks);
  return true;
}

// ---------------------------------------------------------------------------
// Property 5: Valid task addition grows the task list by exactly one
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 5: Valid task addition grows the list
test('Property 5 — valid task addition grows the task list by exactly one', () => {
  /**
   * Validates: Requirements 6.2, 6.3
   *
   * For any valid task string (trimmed length 1–100):
   *   - addTask() must return true
   *   - The task list must grow from N to N + 1
   *   - The new entry's text must equal the trimmed input
   */
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 100 }),
      (text) => {
        // Only test strings whose trimmed form is still valid (1–100 chars)
        fc.pre(text.trim().length >= 1 && text.trim().length <= 100);

        // Reset store before each iteration
        _taskStore = [];

        const beforeCount = loadTasks().length; // 0
        const result = addTask(text);

        expect(result).toBe(true);
        const tasks = loadTasks();
        expect(tasks.length).toBe(beforeCount + 1);
        expect(tasks[tasks.length - 1].text).toBe(text.trim());
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Property 6: Whitespace-only and oversized task names are always rejected
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 6: Invalid task names are rejected
test('Property 6a — whitespace-only task names are always rejected', () => {
  /**
   * Validates: Requirements 6.5
   *
   * For any string composed entirely of whitespace characters
   * (spaces, tabs, newlines):
   *   - validateTaskText() must return false
   *   - addTask() must return false and leave the list unchanged
   */
  fc.assert(
    fc.property(
      fc.stringOf(fc.constantFrom(' ', '\t', '\n')),
      (whitespaceStr) => {
        // Reset store before each iteration
        _taskStore = [];
        const beforeCount = loadTasks().length; // always 0 after reset

        // validateTaskText must reject the whitespace-only string
        expect(validateTaskText(whitespaceStr)).toBe(false);

        // addTask must return false and not mutate the list
        const result = addTask(whitespaceStr);
        expect(result).toBe(false);
        expect(loadTasks().length).toBe(beforeCount);
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 6b — oversized task names (trimmed length > 100) are always rejected', () => {
  /**
   * Validates: Requirements 6.6
   *
   * For any string whose trimmed length exceeds 100 characters:
   *   - validateTaskText() must return false
   *   - addTask() must return false and leave the list unchanged
   */
  fc.assert(
    fc.property(
      // Generate a base string of 101–200 non-whitespace characters to ensure
      // the trimmed length is definitively > 100.  Padding with optional
      // surrounding whitespace keeps the trimmed-length violation intact.
      fc.tuple(
        fc.string({ minLength: 101, maxLength: 200 }).filter(s => s.trim().length > 100),
        fc.string({ maxLength: 5 }).map(s => s.replace(/\S/g, ' ')), // leading spaces
        fc.string({ maxLength: 5 }).map(s => s.replace(/\S/g, ' '))  // trailing spaces
      ),
      ([core, leading, trailing]) => {
        const oversizedStr = leading + core + trailing;

        // Confirm precondition: trimmed length is genuinely > 100
        fc.pre(oversizedStr.trim().length > 100);

        // Reset store before each iteration
        _taskStore = [];
        const beforeCount = loadTasks().length;

        // validateTaskText must reject the oversized string
        expect(validateTaskText(oversizedStr)).toBe(false);

        // addTask must return false and not mutate the list
        const result = addTask(oversizedStr);
        expect(result).toBe(false);
        expect(loadTasks().length).toBe(beforeCount);
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Supporting unit tests — specific edge cases
// ---------------------------------------------------------------------------

test('validateTaskText returns false for empty string', () => {
  expect(validateTaskText('')).toBe(false);
});

test('validateTaskText returns false for whitespace-only string', () => {
  expect(validateTaskText('   ')).toBe(false);
  expect(validateTaskText('\t')).toBe(false);
  expect(validateTaskText('\n')).toBe(false);
  expect(validateTaskText(' \t\n ')).toBe(false);
});

test('validateTaskText returns false for null and undefined', () => {
  expect(validateTaskText(null)).toBe(false);
  expect(validateTaskText(undefined)).toBe(false);
});

test('validateTaskText returns false for a string with trimmed length > 100', () => {
  const tooLong = 'x'.repeat(101);
  expect(validateTaskText(tooLong)).toBe(false);
});

test('validateTaskText returns true for a single non-whitespace character', () => {
  expect(validateTaskText('a')).toBe(true);
});

test('validateTaskText returns true for a string of exactly 100 characters', () => {
  const exactly100 = 'a'.repeat(100);
  expect(validateTaskText(exactly100)).toBe(true);
});

test('validateTaskText returns false for a string of exactly 101 characters', () => {
  const exactly101 = 'a'.repeat(101);
  expect(validateTaskText(exactly101)).toBe(false);
});

test('addTask returns false for empty string and does not grow the list', () => {
  _taskStore = [];
  expect(addTask('')).toBe(false);
  expect(loadTasks().length).toBe(0);
});

test('addTask returns false for whitespace-only string and does not grow the list', () => {
  _taskStore = [];
  expect(addTask('   \t\n')).toBe(false);
  expect(loadTasks().length).toBe(0);
});

test('addTask returns false for oversized string and does not grow the list', () => {
  _taskStore = [];
  expect(addTask('x'.repeat(101))).toBe(false);
  expect(loadTasks().length).toBe(0);
});

test('addTask with existing tasks does not grow list when input is invalid', () => {
  _taskStore = [];
  addTask('Task One');
  addTask('Task Two');
  const countBefore = loadTasks().length; // 2

  addTask('   '); // whitespace — rejected
  addTask('');    // empty — rejected
  addTask('x'.repeat(200)); // too long — rejected

  expect(loadTasks().length).toBe(countBefore);
});
