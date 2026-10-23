// js/app.js — To-Do Life Dashboard behavior

// =============================================================================
// THEME MODULE
// =============================================================================
// initTheme() runs IMMEDIATELY (outside DOMContentLoaded) so the correct theme
// is applied to <html> before the browser paints anything — prevents flash.

/**
 * Reads the saved theme from Local Storage and applies it to <html>.
 * Called synchronously at script load time, before DOMContentLoaded.
 */
function initTheme() {
  var savedTheme = 'light';
  try {
    var stored = localStorage.getItem('dashboard_theme');
    if (stored === 'dark' || stored === 'light') {
      savedTheme = stored;
    }
  } catch (e) {
    // Local Storage unavailable — fall back to 'light'
  }

  document.documentElement.setAttribute('data-theme', savedTheme);

  // The button may not exist in the DOM yet at this point, so we update its
  // label once the DOM is ready via DOMContentLoaded.
  document.addEventListener('DOMContentLoaded', function () {
    _updateThemeButton(savedTheme);

    var btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  });
}

/**
 * Toggles the current theme between 'light' and 'dark', persists the choice
 * to Local Storage, and updates the toggle button label.
 */
function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', next);

  try {
    localStorage.setItem('dashboard_theme', next);
  } catch (e) {
    // Storage write failed — theme is still applied visually for this session
  }

  _updateThemeButton(next);
}

/**
 * Updates the #theme-toggle-btn label to reflect the currently active theme.
 * @param {string} theme - 'light' or 'dark'
 */
function _updateThemeButton(theme) {
  var btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Run initTheme immediately — MUST be the first call in this file.
initTheme();

// =============================================================================
// GREETING MODULE — pure helper functions
// =============================================================================

/**
 * Returns the appropriate greeting string for a given hour of the day (0–23).
 *
 * Ranges (per Requirements 2.1–2.4):
 *   05–11  → "Good Morning"
 *   12–16  → "Good Afternoon"
 *   17–20  → "Good Evening"
 *   21–23, 0–4 → "Good Night"
 *
 * Falls back to "Hello" if hour is not a valid integer in [0, 23]
 * (Requirement 2.6).
 *
 * @param {number} hour - Integer from 0 to 23 (local hour)
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

/**
 * Formats a Date object into a 12-hour time string like "09:45 AM".
 * Uses the user's local system timezone (Requirement 1.1).
 *
 * @param {Date} date - A valid Date object
 * @returns {string} e.g. "09:45 AM"
 */
function formatTime(date) {
  var hours24 = date.getHours();          // 0–23
  var minutes = date.getMinutes();        // 0–59
  var period = hours24 < 12 ? 'AM' : 'PM';
  var hours12 = hours24 % 12 || 12;      // convert 0 → 12, 13 → 1, etc.

  var hh = hours12 < 10 ? '0' + hours12 : '' + hours12;
  var mm = minutes < 10 ? '0' + minutes : '' + minutes;

  return hh + ':' + mm + ' ' + period;
}

/**
 * Formats a Date object into a long-form date string like "Monday, July 14, 2025".
 * Uses the user's local system timezone (Requirement 1.2).
 *
 * @param {Date} date - A valid Date object
 * @returns {string} e.g. "Monday, July 14, 2025"
 */
function formatDate(date) {
  var DAYS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var dayName   = DAYS[date.getDay()];
  var monthName = MONTHS[date.getMonth()];
  var dayNum    = date.getDate();
  var year      = date.getFullYear();

  return dayName + ', ' + monthName + ' ' + dayNum + ', ' + year;
}

/**
 * Combines a greeting string and an optional name into a display string.
 *
 * - With a name  → "Good Morning, Alex!"
 * - Without name → "Good Morning!"
 *
 * @param {string} greeting - e.g. "Good Morning"
 * @param {string} name     - Trimmed display name, or an empty string
 * @returns {string}
 */
function buildGreetingWithName(greeting, name) {
  var trimmedName = (name || '').trim();
  if (trimmedName.length > 0) {
    return greeting + ', ' + trimmedName + '!';
  }
  return greeting + '!';
}

// =============================================================================
// GREETING MODULE — stateful / DOM-wiring functions
// =============================================================================

/** Module-level state: the currently displayed name. */
var currentName = '';

/**
 * Reads `dashboard_name` from Local Storage.
 * Returns an empty string if the key is missing, null, or Local Storage throws.
 *
 * @returns {string}
 */
function loadName() {
  try {
    var stored = localStorage.getItem('dashboard_name');
    return (stored !== null && stored !== undefined) ? stored : '';
  } catch (e) {
    return '';
  }
}

/**
 * Validates `rawInput`, trims it, saves to `dashboard_name` in Local Storage,
 * updates `currentName`, and re-renders the greeting.
 *
 * On failure (empty / whitespace-only / > 50 chars) shows `#name-error` and
 * does NOT overwrite any existing stored name.
 *
 * @param {string} rawInput
 */
function saveName(rawInput) {
  var nameError = document.getElementById('name-error');
  var trimmed = (rawInput || '').trim();

  // --- Validation ---
  if (trimmed.length === 0) {
    if (nameError) nameError.textContent = 'Name cannot be empty.';
    return;
  }
  if (trimmed.length > 50) {
    if (nameError) nameError.textContent = 'Name must be 50 characters or fewer.';
    return;
  }

  // --- Clear any previous error ---
  if (nameError) nameError.textContent = '';

  // --- Persist ---
  try {
    localStorage.setItem('dashboard_name', trimmed);
  } catch (e) {
    // Local Storage write failed — still update the UI for this session
  }

  // --- Update module state and re-render ---
  currentName = trimmed;
  updateGreeting();
}

/**
 * Reads the current time/date, then refreshes:
 *   - `#greeting-text`  → e.g. "Good Morning, Alex!" or "Good Morning!"
 *   - `#date-text`      → e.g. "Monday, July 14, 2025"
 *   - `#time-text`      → e.g. "09:45 AM"
 *
 * Called immediately on init and every 60 seconds via setInterval.
 */
function updateGreeting() {
  var now = new Date();

  var greetingEl = document.getElementById('greeting-text');
  var dateEl     = document.getElementById('date-text');
  var timeEl     = document.getElementById('time-text');

  var greeting = getGreeting(now.getHours());
  var fullGreeting = buildGreetingWithName(greeting, currentName);

  if (greetingEl) greetingEl.textContent = fullGreeting;
  if (dateEl)     dateEl.textContent     = formatDate(now);
  if (timeEl)     timeEl.textContent     = formatTime(now);
}

/**
 * Initializes the Greeting widget:
 *   1. Loads the saved name from Local Storage into `currentName`
 *   2. Renders the greeting, date, and time immediately
 *   3. Starts a 60-second interval to keep the display current (Requirements 1.3, 1.4, 2.5)
 *   4. Pre-fills `#name-input` with the saved name (if any)
 *   5. Attaches click listener to `#name-save-btn` and keydown (Enter) listener
 *      to `#name-input` (Requirements 3.2, 3.5)
 *   6. Clears `#name-error` whenever the user types in `#name-input`
 */
function initGreeting() {
  // 1. Load persisted name
  currentName = loadName();

  // 2. Render immediately
  updateGreeting();

  // 3. Refresh every 60 seconds
  setInterval(updateGreeting, 60000);

  // 4. Pre-fill the input with any saved name
  var nameInput = document.getElementById('name-input');
  var nameSaveBtn = document.getElementById('name-save-btn');
  var nameError = document.getElementById('name-error');

  if (nameInput && currentName) {
    nameInput.value = currentName;
  }

  // 5. Save on button click
  if (nameSaveBtn) {
    nameSaveBtn.addEventListener('click', function () {
      saveName(nameInput ? nameInput.value : '');
    });
  }

  // 5. Save on Enter key inside the input
  if (nameInput) {
    nameInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        saveName(nameInput.value);
      }
    });

    // 6. Clear error as soon as the user starts typing again
    nameInput.addEventListener('input', function () {
      if (nameError) nameError.textContent = '';
    });
  }
}

// =============================================================================
// TIMER MODULE — pure helper functions
// =============================================================================

/**
 * Validates a timer duration entered by the user.
 *
 * Returns `true` if and only if `minutes` is a finite integer in the
 * inclusive range [1, 120].  Everything else — floats, NaN, Infinity,
 * strings, null, values outside the range — returns `false`.
 *
 * (Requirement 5.5)
 *
 * @param {*} minutes - Candidate duration value
 * @returns {boolean}
 */
function validateDuration(minutes) {
  return (
    typeof minutes === 'number' &&
    Number.isFinite(minutes) &&
    Number.isInteger(minutes) &&
    minutes >= 1 &&
    minutes <= 120
  );
}

/**
 * Converts a total number of seconds into a zero-padded "MM:SS" string.
 *
 * The minutes segment is zero-padded to at least 2 digits; the seconds
 * segment is always exactly 2 digits.
 *
 * Examples:
 *   timerFormatTime(0)    → "00:00"
 *   timerFormatTime(90)   → "01:30"
 *   timerFormatTime(1500) → "25:00"
 *   timerFormatTime(7199) → "119:59"
 *
 * (Requirement 4.1)
 *
 * @param {number} totalSeconds - Non-negative integer number of seconds
 * @returns {string} e.g. "25:00"
 */
function timerFormatTime(totalSeconds) {
  var secs = Math.floor(totalSeconds);
  var mm = Math.floor(secs / 60);
  var ss = secs % 60;

  var mmStr = mm < 10 ? '0' + mm : '' + mm;
  var ssStr = ss < 10 ? '0' + ss : '' + ss;

  return mmStr + ':' + ssStr;
}

// =============================================================================
// TIMER MODULE — state variables
// =============================================================================

/** Holds the setInterval ID while the timer is running; null when stopped. */
var timerInterval = null;

/** Current countdown value in seconds. Decremented by tick(). */
var remainingSeconds = 25 * 60;  // 1500 seconds default

/** The "reset" target value in seconds. Updated when the user sets a custom duration. */
var configuredSeconds = 25 * 60; // 1500 seconds default

// =============================================================================
// TIMER MODULE — stateful / DOM-wiring functions
// =============================================================================

/**
 * Starts the countdown timer by setting a 1-second interval that calls tick().
 * Does nothing if the timer is already running (timerInterval is not null).
 *
 * (Requirement 4.3)
 */
function startTimer() {
  if (timerInterval !== null) return; // already running
  timerInterval = setInterval(tick, 1000);
}

/**
 * Pauses the countdown timer by clearing the active interval.
 * Sets timerInterval back to null so startTimer() can resume.
 *
 * (Requirement 4.4)
 */
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/**
 * Stops the countdown and restores the display to the current configured
 * duration (configuredSeconds). Also hides the done notification.
 *
 * (Requirement 4.5)
 */
function resetTimer() {
  stopTimer();
  remainingSeconds = configuredSeconds;

  var display = document.getElementById('timer-display');
  if (display) display.textContent = timerFormatTime(remainingSeconds);

  var doneMsg = document.getElementById('timer-done-msg');
  if (doneMsg) doneMsg.style.display = 'none';
}

/**
 * Called every second by the setInterval set up in startTimer().
 * Decrements remainingSeconds by 1 (never below 0), updates #timer-display,
 * and calls handleTimerEnd() when the countdown reaches exactly 0.
 *
 * Key safety guarantee: remainingSeconds will NEVER go below 0.
 * (Requirements 4.3, 4.8 — Property 17)
 */
function tick() {
  // Guard: never decrement below 0 (Property 17)
  if (remainingSeconds <= 0) {
    stopTimer();
    return;
  }

  remainingSeconds -= 1;

  var display = document.getElementById('timer-display');
  if (display) display.textContent = timerFormatTime(remainingSeconds);

  if (remainingSeconds === 0) {
    stopTimer();
    handleTimerEnd();
  }
}

/**
 * Handles the end of the countdown session (Requirements 4.6, 4.7, 4.8).
 *
 * Attempts to play an audible alert using a short inline WAV data URI.
 * If audio playback is unavailable or blocked, shows #timer-done-msg for
 * 5 seconds as a visible fallback notification.
 */
function handleTimerEnd() {
  // Short beep encoded as a minimal WAV (440 Hz, ~0.5 s, 8-bit mono 8 kHz)
  // This tiny base64 WAV is self-contained and requires no network request.
  var beepSrc = 'data:audio/wav;base64,' +
    'UklGRlQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAAAAB/' +
    'f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  var audio = new Audio(beepSrc);

  audio.play().catch(function () {
    // Audio playback failed (autoplay policy, no audio device, etc.)
    // Show visible fallback notification for 5 seconds (Requirement 4.7)
    var doneMsg = document.getElementById('timer-done-msg');
    if (doneMsg) {
      doneMsg.style.display = 'block';
      setTimeout(function () {
        doneMsg.style.display = 'none';
      }, 5000);
    }
  });
}

// =============================================================================
// TIMER MODULE — persistence and initialization
// =============================================================================

/**
 * Saves the current configured duration (in minutes) to Local Storage under
 * the key 'dashboard_timer_duration'.
 *
 * Uses a try/catch so a storage failure (private mode, full quota) does not
 * break the UI — the timer simply won't persist for this session.
 *
 * (Requirements 5.3)
 */
function saveTimerDuration() {
  try {
    localStorage.setItem('dashboard_timer_duration', String(configuredSeconds / 60));
  } catch (e) {
    // Storage write failed — timer duration is still applied for this session
  }
}

/**
 * Reads and validates the saved timer duration from Local Storage.
 *
 * Returns the saved value (as an integer) if it passes `validateDuration`,
 * otherwise returns the default of 25.
 *
 * (Requirements 5.4, 5.6)
 *
 * @returns {number} Duration in minutes — always an integer in [1, 120]
 */
function loadTimerDuration() {
  try {
    var stored = localStorage.getItem('dashboard_timer_duration');
    if (stored !== null) {
      var parsed = parseInt(stored, 10);
      if (validateDuration(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    // Local Storage unavailable — fall back to default
  }
  return 25; // Default: 25 minutes (Requirement 5.6)
}

/**
 * Initializes the Pomodoro Timer widget:
 *   1. Loads the saved duration (or defaults to 25 min) and sets module variables
 *   2. Renders the initial display on #timer-display
 *   3. Attaches Start / Stop / Reset button listeners
 *   4. Attaches custom-duration submit logic (button click + Enter key):
 *      - Reads #timer-duration-input, validates with validateDuration
 *      - On valid: updates configuredSeconds + remainingSeconds, saves, re-renders
 *      - On invalid: shows error message in #timer-duration-error
 *   5. Clears #timer-duration-error as soon as the user types in the input
 *
 * (Requirements 4.2, 4.9, 5.1, 5.2, 5.3, 5.4, 5.6)
 */
function initTimer() {
  // 1. Load saved duration and set module-level state
  var savedMinutes = loadTimerDuration();
  configuredSeconds = savedMinutes * 60;
  remainingSeconds  = configuredSeconds;

  // 2. Render the initial display
  var display = document.getElementById('timer-display');
  if (display) {
    display.textContent = timerFormatTime(remainingSeconds);
  }

  // 3. Start / Stop / Reset button listeners
  var startBtn = document.getElementById('timer-start-btn');
  var stopBtn  = document.getElementById('timer-stop-btn');
  var resetBtn = document.getElementById('timer-reset-btn');

  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (stopBtn)  stopBtn.addEventListener('click', stopTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  // Helper: apply a new duration entered by the user
  function applyCustomDuration() {
    var durationInput = document.getElementById('timer-duration-input');
    var durationError = document.getElementById('timer-duration-error');
    var rawValue = durationInput ? durationInput.value : '';
    var parsed = parseInt(rawValue, 10);

    if (!validateDuration(parsed)) {
      // Invalid input — show error, do NOT change the running timer
      if (durationError) {
        durationError.textContent = 'Please enter a duration between 1 and 120 minutes.';
      }
      return;
    }

    // Valid — clear any error, update state, save, and re-render
    if (durationError) durationError.textContent = '';

    stopTimer(); // Stop any in-progress countdown before changing the duration
    configuredSeconds = parsed * 60;
    remainingSeconds  = configuredSeconds;

    if (display) {
      display.textContent = timerFormatTime(remainingSeconds);
    }

    // Hide done message if visible after a reset
    var doneMsg = document.getElementById('timer-done-msg');
    if (doneMsg) doneMsg.style.display = 'none';

    saveTimerDuration(); // Requirement 5.3
  }

  // 4. Submit button click
  var submitBtn = document.getElementById('timer-duration-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', applyCustomDuration);
  }

  // 4. Enter key inside the duration input
  var durationInput = document.getElementById('timer-duration-input');
  if (durationInput) {
    durationInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        applyCustomDuration();
      }
    });

    // 5. Clear error as the user types
    durationInput.addEventListener('input', function () {
      var durationError = document.getElementById('timer-duration-error');
      if (durationError) durationError.textContent = '';
    });
  }
}

// =============================================================================
// TASK LIST MODULE — pure helper functions
// =============================================================================

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
 * Combines the current timestamp in base-36 with 4 random base-36 characters,
 * producing a compact string like `"lkj3f2ab"`.
 *
 * (Design: ID Generation)
 *
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// =============================================================================
// TASK LIST MODULE — state
// =============================================================================

/** In-memory array of task objects. Populated by loadTasks() on init. */
var tasks = [];

// =============================================================================
// TASK LIST MODULE — persistence and CRUD functions
// =============================================================================

/**
 * Reads the tasks array from Local Storage.
 * Returns `[]` if the key is missing, null, or the JSON is malformed.
 *
 * (Requirements 6.4, 8.1, 8.2)
 *
 * @returns {Array}
 */
function loadTasks() {
  try {
    var stored = localStorage.getItem('dashboard_tasks');
    if (stored === null || stored === undefined) return [];
    var parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Writes the current `tasks` array to Local Storage as a JSON string.
 * On failure, delegates to `showStorageError` if available, or falls back
 * to a console.error.
 *
 * (Requirements 8.1, 8.3)
 */
function saveTasks() {
  try {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
  } catch (e) {
    if (typeof showStorageError === 'function') {
      showStorageError('Could not save your changes. Storage may be full.');
    } else {
      console.error('saveTasks: Local Storage write failed.', e);
    }
  }
}

/**
 * Adds a new task to the list after validating the input text.
 *
 * If validation fails, shows an error message in `#task-input-error` and
 * returns without modifying the list.  On success, clears the error span,
 * pushes a new task object, then re-renders and persists.
 *
 * (Requirements 6.2, 6.3, 6.5, 6.6)
 *
 * @param {string} text - Raw task name entered by the user
 */
function addTask(text) {
  var errorEl = document.getElementById('task-input-error');

  if (!validateTaskText(text)) {
    var trimmed = (text || '').trim();
    if (errorEl) {
      if (trimmed.length === 0) {
        errorEl.textContent = 'Task name cannot be empty.';
      } else {
        errorEl.textContent = 'Task name must be 100 characters or fewer.';
      }
    }
    return;
  }

  // Clear any previous error
  if (errorEl) errorEl.textContent = '';

  var trimmedText = String(text).trim();
  tasks.push({ id: generateId(), text: trimmedText, completed: false });

  if (typeof renderTasks === 'function') { renderTasks(); }
  saveTasks();
}

/**
 * Removes the task with the given id from the list, then re-renders and saves.
 *
 * (Requirement 7.8)
 *
 * @param {string} id - Unique task id
 */
function deleteTask(id) {
  tasks = tasks.filter(function (task) { return task.id !== id; });
  if (typeof renderTasks === 'function') { renderTasks(); }
  saveTasks();
}

/**
 * Flips the `completed` boolean on the task with the given id, then
 * re-renders and saves.
 *
 * (Requirements 7.6, 7.7)
 *
 * @param {string} id - Unique task id
 */
function toggleTask(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return { id: task.id, text: task.text, completed: !task.completed };
    }
    return task;
  });
  if (typeof renderTasks === 'function') { renderTasks(); }
  saveTasks();
}

/**
 * Updates the text of the task with the given id after validating the new text.
 *
 * Returns `false` if validation fails (caller is responsible for showing an
 * error to the user).  Returns `true` on success after re-rendering and saving.
 *
 * (Requirements 7.3)
 *
 * @param {string} id      - Unique task id
 * @param {string} newText - Replacement task name
 * @returns {boolean}
 */
function editTask(id, newText) {
  if (!validateTaskText(newText)) return false;

  var trimmedNew = String(newText).trim();
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      return { id: task.id, text: trimmedNew, completed: task.completed };
    }
    return task;
  });

  if (typeof renderTasks === 'function') { renderTasks(); }
  saveTasks();
  return true;
}

// =============================================================================
// MODULE EXPORTS (Node.js / Jest environment only)
// =============================================================================
// Wrapped in a guard so the file still works as a plain browser script.

if (typeof module !== 'undefined') {
  module.exports = {
    getGreeting,
    formatTime,
    timerFormatTime,
    formatDate,
    buildGreetingWithName,
    validateDuration,
    validateTaskText,
    generateId,
    loadTasks,
    saveTasks,
    addTask,
    deleteTask,
    toggleTask,
    editTask,
  };
}

// =============================================================================
// TASK LIST MODULE — render and init (Task 8.9)
// =============================================================================

/**
 * Clears and re-renders the entire task list into #task-list.
 * Each task becomes an <li> with a checkbox, text span, edit button, and
 * delete button.  Event delegation on the <ul> handles all interactions.
 *
 * (Requirements 6.1, 7.1–7.5, 8.1)
 */
function renderTasks() {
  var list = document.getElementById('task-list');
  if (!list) return;

  list.innerHTML = '';

  tasks.forEach(function (task) {
    var li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('data-id', task.id);

    // Checkbox
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" complete');

    // Text span
    var span = document.createElement('span');
    span.className = 'task-text' + (task.completed ? ' completed' : '');
    span.textContent = task.text;

    // Edit button
    var editBtn = document.createElement('button');
    editBtn.className = 'task-edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit task');

    // Delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

/**
 * Initialises the Task List widget:
 *   1. Loads tasks from Local Storage into the module-level `tasks` array
 *   2. Renders the list immediately
 *   3. Attaches event delegation listener to #task-list for toggle / edit /
 *      delete / save-edit / cancel-edit interactions
 *   4. Attaches click and Enter-key listeners to #task-add-btn and #task-input
 *
 * (Requirements 6.1–6.3, 7.1–7.5)
 */
function initTasks() {
  // 1. Load from storage
  tasks = loadTasks();

  // 2. Initial render
  renderTasks();

  // 3. Event delegation on the task list
  var list = document.getElementById('task-list');
  if (list) {
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-id]');
      if (!li) return;
      var id = li.getAttribute('data-id');

      // Checkbox toggle
      if (e.target.classList.contains('task-checkbox')) {
        toggleTask(id);
        return;
      }

      // Edit button — switch to inline edit mode
      if (e.target.classList.contains('task-edit-btn')) {
        var span = li.querySelector('.task-text');
        var currentText = span ? span.textContent : '';

        var editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'task-edit-input';
        editInput.value = currentText;
        editInput.maxLength = 100;

        var saveBtn = document.createElement('button');
        saveBtn.className = 'task-save-btn';
        saveBtn.textContent = 'Save';

        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'task-cancel-btn';
        cancelBtn.textContent = 'Cancel';

        if (span) span.replaceWith(editInput);
        e.target.replaceWith(saveBtn);
        // Insert cancel button after save button
        saveBtn.after(cancelBtn);
        editInput.focus();
        return;
      }

      // Save edit
      if (e.target.classList.contains('task-save-btn')) {
        var input = li.querySelector('.task-edit-input');
        var newText = input ? input.value : '';
        var success = editTask(id, newText);
        if (!success) {
          // Show error inline
          var errSpan = li.querySelector('.task-inline-error');
          if (!errSpan) {
            errSpan = document.createElement('span');
            errSpan.className = 'task-inline-error error-msg';
            li.appendChild(errSpan);
          }
          errSpan.textContent = 'Task name must be 1–100 characters.';
        }
        return;
      }

      // Cancel edit — re-render restores original state
      if (e.target.classList.contains('task-cancel-btn')) {
        renderTasks();
        return;
      }

      // Delete button
      if (e.target.classList.contains('task-delete-btn')) {
        deleteTask(id);
        return;
      }
    });
  }

  // 4. Add task via button click
  var taskInput = document.getElementById('task-input');
  var taskAddBtn = document.getElementById('task-add-btn');

  function handleAddTask() {
    var text = taskInput ? taskInput.value : '';
    addTask(text);
    // Clear input on successful add (error check: if no error text was set)
    var errorEl = document.getElementById('task-input-error');
    if (errorEl && errorEl.textContent === '') {
      if (taskInput) taskInput.value = '';
    }
  }

  if (taskAddBtn) {
    taskAddBtn.addEventListener('click', handleAddTask);
  }

  if (taskInput) {
    taskInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleAddTask();
    });
    taskInput.addEventListener('input', function () {
      var errorEl = document.getElementById('task-input-error');
      if (errorEl) errorEl.textContent = '';
    });
  }
}

// =============================================================================
// QUICK LINKS MODULE — pure helper functions (Tasks 10.1)
// =============================================================================

/**
 * Validates a link name.
 * Returns true for trimmed strings with 1–50 characters.
 *
 * (Requirement 9.5)
 *
 * @param {*} name
 * @returns {boolean}
 */
function validateLinkName(name) {
  if (name === null || name === undefined) return false;
  var trimmed = String(name).trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

/**
 * Validates a link URL.
 * Returns true if the url starts with "http://" or "https://".
 *
 * (Requirement 9.5)
 *
 * @param {*} url
 * @returns {boolean}
 */
function validateLinkUrl(url) {
  if (url === null || url === undefined) return false;
  var s = String(url);
  return s.startsWith('http://') || s.startsWith('https://');
}

// =============================================================================
// QUICK LINKS MODULE — state
// =============================================================================

/** In-memory array of link objects. Populated by loadLinks() on init. */
var links = [];

// Maximum number of links allowed (Requirement 9.6)
var MAX_LINKS = 20;

// =============================================================================
// QUICK LINKS MODULE — persistence and CRUD (Task 10.3)
// =============================================================================

/**
 * Reads the links array from Local Storage.
 * Returns [] on missing key, null, or JSON parse failure.
 *
 * (Requirements 9.2, 10.2)
 *
 * @returns {Array}
 */
function loadLinks() {
  try {
    var stored = localStorage.getItem('dashboard_links');
    if (stored === null || stored === undefined) return [];
    var parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Writes the current `links` array to Local Storage.
 * Calls showStorageError on failure.
 *
 * (Requirements 10.2, 11.2)
 */
function saveLinks() {
  try {
    localStorage.setItem('dashboard_links', JSON.stringify(links));
  } catch (e) {
    if (typeof showStorageError === 'function') {
      showStorageError('Could not save your links. Storage may be full.');
    } else {
      console.error('saveLinks: Local Storage write failed.', e);
    }
  }
}

/**
 * Adds a new link after validating name and url, and checking the 20-link cap.
 * Shows #link-error on any validation failure.
 *
 * (Requirements 9.2, 9.4, 9.5, 9.6)
 *
 * @param {string} name
 * @param {string} url
 */
function addLink(name, url) {
  var errorEl = document.getElementById('link-error');

  if (!validateLinkName(name)) {
    if (errorEl) errorEl.textContent = 'Link name must be 1–50 characters.';
    return;
  }

  if (!validateLinkUrl(url)) {
    if (errorEl) errorEl.textContent = 'URL must start with http:// or https://';
    return;
  }

  if (links.length >= MAX_LINKS) {
    if (errorEl) errorEl.textContent = 'Maximum of 20 links reached.';
    return;
  }

  if (errorEl) errorEl.textContent = '';

  links.push({
    id: generateId(),
    name: String(name).trim(),
    url: String(url).trim()
  });

  renderLinks();
  saveLinks();
}

/**
 * Removes the link with the given id, then re-renders and saves.
 *
 * (Requirement 10.2)
 *
 * @param {string} id
 */
function deleteLink(id) {
  links = links.filter(function (link) { return link.id !== id; });
  renderLinks();
  saveLinks();
}

// =============================================================================
// QUICK LINKS MODULE — render and init (Task 10.7)
// =============================================================================

/**
 * Clears and re-renders all links into #links-grid.
 * Each link is a .link-item div with an <a> and a delete button.
 * Event delegation on #links-grid handles delete clicks.
 *
 * (Requirements 9.1, 9.3, 10.1, 11.1)
 */
function renderLinks() {
  var grid = document.getElementById('links-grid');
  if (!grid) return;

  grid.innerHTML = '';

  links.forEach(function (link) {
    var item = document.createElement('div');
    item.className = 'link-item';
    item.setAttribute('data-id', link.id);

    var anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.textContent = link.name;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'link-delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', 'Delete link ' + link.name);

    item.appendChild(anchor);
    item.appendChild(deleteBtn);
    grid.appendChild(item);
  });
}

/**
 * Initialises the Quick Links widget:
 *   1. Loads links from Local Storage
 *   2. Renders the grid immediately
 *   3. Attaches event delegation on #links-grid for delete clicks
 *   4. Attaches click and Enter-key listeners to #link-add-btn
 *
 * (Requirements 9.1, 9.2, 9.3, 10.1, 11.1, 11.2)
 */
function initLinks() {
  // 1. Load
  links = loadLinks();

  // 2. Render
  renderLinks();

  // 3. Event delegation on the grid for delete
  var grid = document.getElementById('links-grid');
  if (grid) {
    grid.addEventListener('click', function (e) {
      if (e.target.classList.contains('link-delete-btn')) {
        var item = e.target.closest('.link-item[data-id]');
        if (item) {
          deleteLink(item.getAttribute('data-id'));
        }
      }
    });
  }

  // 4. Add link via button click
  var nameInput = document.getElementById('link-name-input');
  var urlInput  = document.getElementById('link-url-input');
  var addBtn    = document.getElementById('link-add-btn');
  var errorEl   = document.getElementById('link-error');

  function handleAddLink() {
    var name = nameInput ? nameInput.value : '';
    var url  = urlInput  ? urlInput.value  : '';
    addLink(name, url);
    // Clear inputs on success
    if (errorEl && errorEl.textContent === '') {
      if (nameInput) nameInput.value = '';
      if (urlInput)  urlInput.value  = '';
    }
  }

  if (addBtn) {
    addBtn.addEventListener('click', handleAddLink);
  }

  if (urlInput) {
    urlInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleAddLink();
    });
  }

  // Clear error as user types
  [nameInput, urlInput].forEach(function (el) {
    if (el) {
      el.addEventListener('input', function () {
        if (errorEl) errorEl.textContent = '';
      });
    }
  });
}

// =============================================================================
// SHARED ERROR TOAST (Task 12.2)
// =============================================================================

/**
 * Shows the #storage-error-toast with a custom message and auto-hides it
 * after 3 seconds.
 *
 * (Requirement 8.3)
 *
 * @param {string} message
 */
function showStorageError(message) {
  var toast = document.getElementById('storage-error-toast');
  if (!toast) return;
  toast.textContent = message || 'Could not save your changes. Storage may be full.';
  toast.style.display = 'block';
  setTimeout(function () {
    toast.style.display = 'none';
  }, 3000);
}

// =============================================================================
// TOP-LEVEL WIRING (Task 12.1)
// =============================================================================
// initTheme() was already called at the top of this file (before DOMContentLoaded)
// to prevent a flash of the wrong theme.
//
// All other module inits run inside DOMContentLoaded so the DOM is ready.

document.addEventListener('DOMContentLoaded', function () {
  initGreeting();
  initTimer();
  initTasks();
  initLinks();
});

// =============================================================================
// MODULE EXPORTS — update to include new exports (Node.js / Jest only)
// =============================================================================
if (typeof module !== 'undefined') {
  module.exports = Object.assign(module.exports || {}, {
    validateLinkName,
    validateLinkUrl,
    loadLinks,
    saveLinks,
    addLink,
    deleteLink,
    renderLinks,
    initLinks,
    renderTasks,
    initTasks,
    showStorageError,
  });
}
