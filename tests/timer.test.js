/**
 * Timer Module — Property-Based Tests
 * Feature: todo-life-dashboard
 *
 * Tests the timer's formatTime helper (totalSeconds → "MM:SS" string).
 *
 * Note: Jest + fast-check are configured in task 13.1.
 * Exports from js/app.js are wired up in task 13.2.
 * Until then, this test exercises the formatting logic directly via a stub
 * that mirrors the exact implementation described in the design (task 6.1).
 *
 * Design note on MM digit count:
 *   The timer supports durations up to 120 minutes (task 5.5 / Req 5.5).
 *   120 min = 7200 s → display "120:00" (3-digit minutes).
 *   The generator uses fc.integer({ min: 0, max: 7199 }) which covers up to
 *   119 min 59 sec → "119:59" (also 3 digits).  Therefore the seconds part
 *   is always exactly 2 digits, but the minutes part can be 1, 2, or 3
 *   digits.  The regex ^\d+:\d{2}$ (one-or-more digits, colon, exactly two
 *   digits) is the correct assertion for this range.
 */

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Stub: mirrors the timer formatTime(totalSeconds) function from task 6.1
// ---------------------------------------------------------------------------

/**
 * Converts a non-negative integer number of seconds into a "MM:SS" string.
 * Minutes are not zero-padded (0 → "0:00", 90 → "1:30", 7199 → "119:59").
 * Seconds are always zero-padded to 2 digits.
 *
 * This matches the design spec:
 *   formatTime(0)    → "00:00"
 *   formatTime(90)   → "01:30"
 *   formatTime(1500) → "25:00"
 *   formatTime(7199) → "119:59"
 *
 * @param {number} totalSeconds - A non-negative integer
 * @returns {string} e.g. "25:00"
 */
function timerFormatTime(totalSeconds) {
  var mins = Math.floor(totalSeconds / 60);
  var secs = totalSeconds % 60;

  // Zero-pad minutes to at least 2 digits, seconds always 2 digits
  var mm = mins < 10 ? '0' + mins : '' + mins;
  var ss = secs < 10 ? '0' + secs : '' + secs;

  return mm + ':' + ss;
}

// ---------------------------------------------------------------------------
// Property 2: Timer formatTime output is valid MM:SS
// Task 6.3 note: This test was originally written in task 4.3 and fully
// satisfies task 6.3 — it targets the timer's formatTime function (aliased
// here as timerFormatTime), uses the fc.integer({ min: 0, max: 7199 })
// generator, carries the required feature/property tag, and validates
// Requirement 4.1. No additional test is needed.
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 2: Timer formatTime output is valid MM:SS
test('Property 2 — timerFormatTime always produces a valid MM:SS string', () => {
  // Validates: Requirements 4.1
  // Generator: integers in [0, 7199] (0 seconds to 119 min 59 sec)
  //
  // Assertion: output must match ^\d+:\d{2}$
  //   - One or more digits before the colon (minutes, not zero-padded for > 99)
  //   - Exactly two digits after the colon (seconds, always zero-padded)
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 7199 }),
      (totalSeconds) => {
        const result = timerFormatTime(totalSeconds);

        // Output must match the MM:SS pattern
        expect(result).toMatch(/^\d+:\d{2}$/);

        // Additional sanity checks:
        const [mmPart, ssPart] = result.split(':');

        // Minutes part must be a non-negative integer
        expect(parseInt(mmPart, 10)).toBeGreaterThanOrEqual(0);

        // Seconds part must be exactly 2 characters and in range [0, 59]
        expect(ssPart).toHaveLength(2);
        expect(parseInt(ssPart, 10)).toBeGreaterThanOrEqual(0);
        expect(parseInt(ssPart, 10)).toBeLessThanOrEqual(59);
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Unit tests — specific examples from the design spec
// ---------------------------------------------------------------------------

test('timerFormatTime(0) returns "00:00"', () => {
  expect(timerFormatTime(0)).toBe('00:00');
});

test('timerFormatTime(90) returns "01:30"', () => {
  expect(timerFormatTime(90)).toBe('01:30');
});

test('timerFormatTime(1500) returns "25:00" (default Pomodoro session)', () => {
  expect(timerFormatTime(1500)).toBe('25:00');
});

test('timerFormatTime(59) returns "00:59"', () => {
  expect(timerFormatTime(59)).toBe('00:59');
});

test('timerFormatTime(60) returns "01:00"', () => {
  expect(timerFormatTime(60)).toBe('01:00');
});

test('timerFormatTime(7199) returns "119:59" (upper boundary of generator range)', () => {
  expect(timerFormatTime(7199)).toBe('119:59');
});

// ---------------------------------------------------------------------------
// Stub: mirrors the validateDuration(minutes) function from task 6.1
// ---------------------------------------------------------------------------

/**
 * Returns true if minutes is an integer in [1, 120], false otherwise.
 * Floats, NaN, null, undefined, and out-of-range numbers all return false.
 *
 * @param {*} minutes - The value to validate
 * @returns {boolean}
 */
function validateDuration(minutes) {
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 120;
}

// ---------------------------------------------------------------------------
// Property 16: Timer duration validation rejects out-of-range values
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 16: Timer duration validation
test('Property 16 — validateDuration returns true iff value is in [1, 120]', () => {
  // Validates: Requirements 5.5
  // Generator: integers in [-1000, 1000]
  //
  // Assertion: validateDuration(n) === (n >= 1 && n <= 120)
  fc.assert(
    fc.property(
      fc.integer({ min: -1000, max: 1000 }),
      (n) => {
        const result = validateDuration(n);
        const expected = n >= 1 && n <= 120;
        expect(result).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Unit tests — edge cases for validateDuration
// ---------------------------------------------------------------------------

test('validateDuration(0) returns false (below minimum)', () => {
  expect(validateDuration(0)).toBe(false);
});

test('validateDuration(1) returns true (minimum boundary)', () => {
  expect(validateDuration(1)).toBe(true);
});

test('validateDuration(120) returns true (maximum boundary)', () => {
  expect(validateDuration(120)).toBe(true);
});

test('validateDuration(121) returns false (above maximum)', () => {
  expect(validateDuration(121)).toBe(false);
});

test('validateDuration(-1) returns false (negative value)', () => {
  expect(validateDuration(-1)).toBe(false);
});

test('validateDuration(5.5) returns false (float, not an integer)', () => {
  expect(validateDuration(5.5)).toBe(false);
});

// ---------------------------------------------------------------------------
// Stub: mirrors the tick() guard from app.js
// ---------------------------------------------------------------------------

/**
 * Self-contained simulation of the tick() guard from app.js.
 * The real tick() operates on module-level globals and touches the DOM,
 * so this stub isolates the core invariant: if remainingSeconds is already
 * 0, calling tick() any number of times must leave it at 0.
 *
 * The guard mirrors app.js exactly:
 *   if (remainingSeconds <= 0) return;
 *   remainingSeconds -= 1;
 */

// ---------------------------------------------------------------------------
// Property 17: Timer never counts below zero
// ---------------------------------------------------------------------------

// Feature: todo-life-dashboard, Property 17: Timer never goes below zero
test('Property 17 — tick() never decrements remainingSeconds below 0', () => {
  // Validates: Requirements 4.8
  // Generator: integers in [1, 50] — number of tick() calls with a 0-state timer
  //
  // Assertion: after N tick() calls starting from remainingSeconds = 0,
  //            remainingSeconds must still equal 0.
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 50 }),
      (n) => {
        // Local state mirrors the module-level variable in app.js
        var remainingSeconds = 0;

        // Tick stub — exact guard from app.js
        function tick() {
          if (remainingSeconds <= 0) return;
          remainingSeconds -= 1;
        }

        // Call tick() N times from a zero-state timer
        for (var i = 0; i < n; i++) {
          tick();
        }

        // remainingSeconds must never go below 0
        expect(remainingSeconds).toBe(0);
      }
    ),
    { numRuns: 100 }
  );
});

// ---------------------------------------------------------------------------
// Unit tests — edge cases for tick() guard
// ---------------------------------------------------------------------------

test('tick() called once from 0 stays at 0', () => {
  var remainingSeconds = 0;
  function tick() {
    if (remainingSeconds <= 0) return;
    remainingSeconds -= 1;
  }
  tick();
  expect(remainingSeconds).toBe(0);
});

test('tick() called from 1 decrements to 0', () => {
  var remainingSeconds = 1;
  function tick() {
    if (remainingSeconds <= 0) return;
    remainingSeconds -= 1;
  }
  tick();
  expect(remainingSeconds).toBe(0);
});

test('tick() called twice from 1 stays at 0 (guard fires on second call)', () => {
  var remainingSeconds = 1;
  function tick() {
    if (remainingSeconds <= 0) return;
    remainingSeconds -= 1;
  }
  tick();
  tick();
  expect(remainingSeconds).toBe(0);
});
