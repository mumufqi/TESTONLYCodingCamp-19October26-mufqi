# Implementation Plan: To-Do Life Dashboard

## Overview

Build a single-page browser dashboard using plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools. The app is structured across three files (`index.html`, `css/style.css`, `js/app.js`) and persists all data in the browser's Local Storage. Implementation is ordered from scaffolding → styling → features → wiring → testing, so every step produces visible, working output.

## Tasks

- [x] 1. Scaffold the project file structure and HTML skeleton
  - [x] 1.1 Create the three project files: `index.html`, `css/style.css`, and `js/app.js`
    - `index.html` is the entry point, `css/style.css` holds all styles, `js/app.js` holds all behavior
    - Link the CSS file in the `<head>` and the JS file at the bottom of `<body>`
    - Add `data-theme="light"` on the `<html>` element as the default
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 1.2 Add all HTML sections and element IDs to `index.html`
    - Add a `<section>` for the Greeting Widget with elements: `#greeting-text`, `#date-text`, `#time-text`, `#name-input`, `#name-save-btn`, `#name-error`
    - Add a `<section>` for the Timer with elements: `#timer-display`, `#timer-start-btn`, `#timer-stop-btn`, `#timer-reset-btn`, `#timer-duration-input`, `#timer-duration-submit`, `#timer-duration-error`, `#timer-done-msg`
    - Add a `<section>` for the Task List with elements: `#task-input`, `#task-add-btn`, `#task-input-error`, `#task-list` (`<ul>`)
    - Add a `<section>` for Quick Links with elements: `#link-name-input`, `#link-url-input`, `#link-add-btn`, `#link-error`, `#links-grid`
    - Add a `#theme-toggle-btn` button in the header or nav
    - Add a `#storage-error-toast` element (hidden by default) for Local Storage failure messages
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 9.1, 10.1, 12.1_

- [x] 2. Add base CSS styles and theme variables
  - [x] 2.1 Define CSS custom properties for light and dark themes using `data-theme` attribute selectors
    - Declare `--bg`, `--text`, `--card-bg`, `--border`, `--accent` variables under `[data-theme="light"]` and `[data-theme="dark"]`
    - Apply variables to `body`, sections, inputs, and buttons
    - _Requirements: 12.1, 12.2_

  - [x] 2.2 Style the layout, typography, and all UI components
    - Use a single-column or two-column grid layout so all sections are visible on one screen
    - Style each section card, input fields, buttons, checkboxes, and link items
    - Add `.task-text.completed` rule with `text-decoration: strikethrough` for completed tasks
    - Style `#timer-done-msg` and `#storage-error-toast` as hidden by default (`display: none`)
    - _Requirements: 7.6, 12.2, 13.4_

- [x] 3. Implement the Theme module (`js/app.js` — theme section)
  - [x] 3.1 Write `initTheme()` and `toggleTheme()` in `js/app.js`
    - `initTheme()` reads `dashboard_theme` from Local Storage synchronously, applies `data-theme` to `<html>`, and updates the button label — this must be the **first** call in `app.js`, before `DOMContentLoaded`, to prevent a flash of the wrong theme
    - `toggleTheme()` flips the current theme, saves the new value to Local Storage, and updates the button label
    - Attach a click listener to `#theme-toggle-btn`
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

  - [x] 3.2 Write property test for theme save-load round trip (Property 15)
    - **Property 15: Theme save-load round trip preserves the selected theme**
    - **Validates: Requirements 12.3, 12.4**
    - Use `fc.constantFrom("light", "dark")` as the generator
    - _Tag: `// Feature: todo-life-dashboard, Property 15: Theme save-load round trip`_

- [x] 4. Implement the Greeting module (`js/app.js` — greeting section)
  - [x] 4.1 Write `getGreeting(hour)`, `formatTime(date)`, `formatDate(date)`, and `buildGreetingWithName(greeting, name)`
    - `getGreeting` maps hour 0–23 → `"Good Morning"` (5–11), `"Good Afternoon"` (12–16), `"Good Evening"` (17–20), `"Good Night"` (21–23, 0–4), fallback `"Hello"`
    - `formatTime` returns `"09:45 AM"` format from a `Date` object
    - `formatDate` returns `"Monday, July 14, 2025"` format from a `Date` object
    - `buildGreetingWithName` returns `"Good Morning, Alex!"` if a name is set, or `"Good Morning!"` if not
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.6_

  - [x] 4.2 Write property test for greeting hour mapping (Property 1)
    - **Property 1: Greeting maps correctly for all hours**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - Use `fc.integer({ min: 0, max: 23 })` as the generator
    - _Tag: `// Feature: todo-life-dashboard, Property 1: Greeting maps hours to correct string`_

  - [x] 4.3 Write property test for time formatting output (Property 2)
    - **Property 2: Time formatting always produces valid MM:SS output**
    - **Validates: Requirements 4.1**
    - Use `fc.integer({ min: 0, max: 7199 })` as the generator; assert output matches `^\d{2}:\d{2}$`
    - _Tag: `// Feature: todo-life-dashboard, Property 2: Timer formatTime output is valid MM:SS`_

  - [x] 4.4 Write `saveName(rawInput)`, `loadName()`, and `updateGreeting()`, then write `initGreeting()`
    - `saveName` trims the input, validates 1–50 chars, saves to `dashboard_name` in Local Storage, and re-renders the greeting; shows `#name-error` on failure
    - `loadName` reads `dashboard_name` from Local Storage (returns `""` on missing/null)
    - `updateGreeting` refreshes `#greeting-text`, `#date-text`, `#time-text` from the current `Date`
    - `initGreeting` loads the saved name, calls `updateGreeting` immediately, starts `setInterval(updateGreeting, 60000)`, and attaches click/Enter listeners to the save button and input
    - _Requirements: 1.3, 1.4, 2.5, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.5 Write property test for whitespace name rejection (Property 3)
    - **Property 3: Whitespace-only names are always rejected**
    - **Validates: Requirements 3.6**
    - Use `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` as the generator
    - _Tag: `// Feature: todo-life-dashboard, Property 3: Whitespace names are rejected`_

  - [x] 4.6 Write property test for name save-load round trip (Property 4)
    - **Property 4: Name save-load round trip preserves trimmed value**
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - Use `fc.string({ minLength: 1, maxLength: 50 })` as the generator
    - _Tag: `// Feature: todo-life-dashboard, Property 4: Name save-load round trip`_

- [x] 5. Checkpoint — test greeting and theme in the browser
  - Ensure all tests pass, ask the user if questions arise.
  - Open `index.html` directly in a browser, verify the greeting shows the correct time-based message, the date updates, and the dark/light toggle switches themes without a flash on reload.

- [x] 6. Implement the Timer module (`js/app.js` — timer section)
  - [x] 6.1 Write `validateDuration(minutes)` and the timer `formatTime(totalSeconds)` helper
    - `validateDuration` returns `true` for integers 1–120, `false` for anything else
    - `formatTime` converts total seconds to `"MM:SS"` with zero-padding (e.g., `90` → `"01:30"`)
    - _Requirements: 4.1, 5.5_

  - [x] 6.2 Write property test for timer duration validation (Property 16)
    - **Property 16: Timer duration validation rejects out-of-range values**
    - **Validates: Requirements 5.5**
    - Use `fc.integer({ min: -1000, max: 1000 })` as the generator; assert true iff value is in [1, 120]
    - _Tag: `// Feature: todo-life-dashboard, Property 16: Timer duration validation`_

  - [x] 6.3 Write property test for timer formatTime output (Property 2 — timer variant)
    - Already covered by Property 2 in task 4.3; verify the same test covers the timer's `formatTime` function as well
    - _Requirements: 4.1_

  - [x] 6.4 Write `startTimer()`, `stopTimer()`, `resetTimer()`, `tick()`, and `handleTimerEnd()`
    - Module-level variables: `timerInterval = null`, `remainingSeconds`, `configuredSeconds`
    - `tick` decrements `remainingSeconds`, updates `#timer-display`, calls `handleTimerEnd` when it hits 0
    - `handleTimerEnd` calls `audio.play()` and catches rejection to show `#timer-done-msg` for 5 seconds as a fallback
    - `resetTimer` clears the interval and restores `remainingSeconds` to `configuredSeconds`
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 6.5 Write property test for timer never going below zero (Property 17)
    - **Property 17: Timer never counts below zero**
    - **Validates: Requirements 4.8**
    - Set `remainingSeconds = 0` and call `tick()` N times (random N from `fc.integer({ min: 1, max: 50 })`); assert `remainingSeconds` stays at 0
    - _Tag: `// Feature: todo-life-dashboard, Property 17: Timer never goes below zero`_

  - [x] 6.6 Write `saveTimerDuration()`, `loadTimerDuration()`, and `initTimer()`
    - `initTimer` loads the saved duration from `dashboard_timer_duration` (validates 1–120), sets module variables, renders initial display, attaches button/input listeners
    - Wrap Local Storage reads/writes in `try/catch`
    - _Requirements: 4.2, 4.9, 5.1, 5.2, 5.3, 5.4, 5.6_

- [x] 7. Checkpoint — test the timer in the browser
  - Ensure all tests pass, ask the user if questions arise.
  - Open `index.html`, verify start/stop/reset work, a custom duration saves and reloads on page refresh, and the done notification appears when counting down from 1.

- [ ] 8. Implement the Task List module (`js/app.js` — tasks section)
  - [x] 8.1 Write `validateTaskText(text)` and `generateId()`
    - `validateTaskText` returns `true` for trimmed strings with 1–100 characters, `false` otherwise
    - `generateId` returns `Date.now().toString(36) + Math.random().toString(36).slice(2, 6)`
    - _Requirements: 6.2, 6.5, 6.6_

  - [ ] 8.2 Write property test for valid task addition growing the list (Property 5)
    - **Property 5: Valid task addition grows the task list by exactly one**
    - **Validates: Requirements 6.2, 6.3**
    - Use `fc.string({ minLength: 1, maxLength: 100 })` as the generator
    - _Tag: `// Feature: todo-life-dashboard, Property 5: Valid task addition grows the list`_

  - [ ] 8.3 Write property test for invalid task names being rejected (Property 6)
    - **Property 6: Whitespace-only and oversized task names are always rejected**
    - **Validates: Requirements 6.5, 6.6**
    - Use whitespace-only strings and strings with trimmed length > 100 as generators
    - _Tag: `// Feature: todo-life-dashboard, Property 6: Invalid task names are rejected`_

  - [ ] 8.4 Write `loadTasks()`, `saveTasks()`, `addTask(text)`, `deleteTask(id)`, `toggleTask(id)`, and `editTask(id, newText)`
    - `loadTasks` reads `dashboard_tasks` from Local Storage (returns `[]` on missing or JSON parse failure)
    - `saveTasks` wraps `localStorage.setItem` in `try/catch` and shows the error toast on failure
    - `addTask` validates text, pushes a new `{ id, text, completed: false }` object, calls `renderTasks` and `saveTasks`
    - `deleteTask` filters out the task by id, re-renders, and saves
    - `toggleTask` flips the `completed` boolean, re-renders, and saves
    - `editTask` validates the new text, updates the task's `text` field, re-renders, and saves
    - _Requirements: 6.2, 6.3, 6.4, 7.3, 7.6, 7.7, 7.8, 8.1, 8.2, 8.3_

  - [ ] 8.5 Write property test for task add-load round trip (Property 7)
    - **Property 7: Task add-load round trip preserves all tasks**
    - **Validates: Requirements 6.4, 8.1, 8.2**
    - Generate sequences of valid task strings; call `saveTasks()` then `loadTasks()` and assert full equality
    - _Tag: `// Feature: todo-life-dashboard, Property 7: Task add-load round trip`_

  - [ ] 8.6 Write property test for task completion toggle being self-inverse (Property 8)
    - **Property 8: Task completion toggle is an involution**
    - **Validates: Requirements 7.6, 7.7**
    - Generate any task object; call `toggleTask(id)` twice and assert `completed` is unchanged
    - _Tag: `// Feature: todo-life-dashboard, Property 8: Toggle completion is self-inverse`_

  - [ ] 8.7 Write property test for task deletion removing only the target (Property 9)
    - **Property 9: Task deletion removes exactly the targeted task**
    - **Validates: Requirements 7.8**
    - Generate a task list (N items) + a valid id; call `deleteTask(id)` and assert exactly N-1 tasks remain with no item matching that id
    - _Tag: `// Feature: todo-life-dashboard, Property 9: Task deletion removes only the target`_

  - [ ] 8.8 Write property test for task edits persisting new text (Property 10)
    - **Property 10: Valid task edits persist the new text**
    - **Validates: Requirements 7.3**
    - Generate any task + valid replacement text; call `editTask(id, newText)` and assert only that task's text changed
    - _Tag: `// Feature: todo-life-dashboard, Property 10: Task edits persist new text`_

  - [ ] 8.9 Write `renderTasks()` and `initTasks()`
    - `renderTasks` clears `#task-list` and re-renders all tasks as `<li>` elements matching the HTML structure from the design (checkbox, span, edit button, delete button)
    - Use event delegation: attach one listener to `#task-list` and check `event.target` to handle checkbox, edit, delete, save, and cancel clicks
    - When editing, replace the `<span>` with an `<input>` pre-filled with the current text plus Save/Cancel buttons
    - `initTasks` calls `loadTasks` and `renderTasks`, then attaches listeners to `#task-input` and `#task-add-btn`
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1_

- [ ] 9. Checkpoint — test the task list in the browser
  - Ensure all tests pass, ask the user if questions arise.
  - Open `index.html`, add several tasks, edit one, mark one complete (strikethrough should appear), delete one, then reload the page and verify all changes persisted.

- [ ] 10. Implement the Quick Links module (`js/app.js` — links section)
  - [ ] 10.1 Write `validateLinkName(name)` and `validateLinkUrl(url)`
    - `validateLinkName` returns `true` for trimmed strings with 1–50 characters
    - `validateLinkUrl` returns `true` if the url starts with `http://` or `https://`
    - _Requirements: 9.5_

  - [ ] 10.2 Write property test for URL validation (Property 11)
    - **Property 11: URL validation correctly accepts and rejects inputs**
    - **Validates: Requirements 9.5**
    - Use `fc.string()` as the generator; assert `validateLinkUrl` returns true iff the string starts with `http://` or `https://`
    - _Tag: `// Feature: todo-life-dashboard, Property 11: URL validation`_

  - [ ] 10.3 Write `loadLinks()`, `saveLinks()`, `addLink(name, url)`, and `deleteLink(id)`
    - `addLink` validates both fields and rejects if 20 links already exist; shows `#link-error` on any failure
    - `deleteLink` filters by id, re-renders, and saves
    - Wrap all Local Storage writes in `try/catch`
    - _Requirements: 9.2, 9.4, 9.5, 9.6, 10.2, 11.2_

  - [ ] 10.4 Write property test for valid link addition growing the list (Property 12)
    - **Property 12: Valid link addition grows the links list by exactly one**
    - **Validates: Requirements 9.2**
    - Generate valid name/url pairs with a list starting at fewer than 20 items; assert length increases by 1
    - _Tag: `// Feature: todo-life-dashboard, Property 12: Valid link addition grows the list`_

  - [ ] 10.5 Write property test for links list never exceeding 20 (Property 13)
    - **Property 13: Links list never exceeds 20 items**
    - **Validates: Requirements 9.6**
    - Generate sequences of `addLink` calls; assert the array length never exceeds 20
    - _Tag: `// Feature: todo-life-dashboard, Property 13: Links list never exceeds 20`_

  - [ ] 10.6 Write property test for link deletion removing only the target (Property 14)
    - **Property 14: Link deletion removes exactly the targeted link**
    - **Validates: Requirements 10.2**
    - Generate a links list + valid id; call `deleteLink(id)` and assert no item with that id remains and all others are unchanged
    - _Tag: `// Feature: todo-life-dashboard, Property 14: Link deletion removes only the target`_

  - [ ] 10.7 Write `renderLinks()` and `initLinks()`
    - `renderLinks` clears `#links-grid` and renders each link as a `.link-item` div containing an `<a target="_blank" rel="noopener noreferrer">` and a delete button
    - Use event delegation on `#links-grid` to handle delete clicks
    - `initLinks` calls `loadLinks` and `renderLinks`, then attaches listeners to inputs and `#link-add-btn`
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 11.1, 11.2_

- [ ] 11. Checkpoint — test quick links in the browser
  - Ensure all tests pass, ask the user if questions arise.
  - Add 3–4 links and verify they open in new tabs. Try adding a link with a bad URL and confirm the error message appears. Add links until the 20-link limit is hit and verify the cap message.

- [ ] 12. Wire all modules together in `app.js`
  - [ ] 12.1 Write the top-level initialization sequence in `app.js`
    - Call `initTheme()` immediately (outside `DOMContentLoaded`) as the very first line so the theme is applied before any paint
    - Inside a `DOMContentLoaded` listener, call `initGreeting()`, `initTimer()`, `initTasks()`, `initLinks()` in order
    - _Requirements: 12.4, 13.4_

  - [ ] 12.2 Add the shared error toast handler for Local Storage failures
    - Write a `showStorageError(message)` helper that makes `#storage-error-toast` visible with the given message and auto-hides it after 3 seconds
    - Replace any inline error handling in `saveTasks`, `saveLinks`, `saveTimerDuration`, and `saveName` with a call to this shared helper
    - _Requirements: 8.3_

- [ ] 13. Set up the Jest + fast-check testing environment
  - [ ] 13.1 Create `package.json` with Jest and fast-check as dev dependencies and configure the test script
    - Run `npm init -y` to create `package.json`, then add `jest` and `fast-check` to `devDependencies`
    - Add `"test": "jest"` to the scripts section
    - Add `"jest": { "testEnvironment": "jsdom" }` configuration so DOM globals are available
    - _Requirements: (testing infrastructure — supports all property tests)_

  - [ ] 13.2 Refactor `js/app.js` to export all pure helper functions for testing
    - Wrap the export block in a Node.js environment check so the file still works as a plain browser script: `if (typeof module !== 'undefined') { module.exports = { getGreeting, formatTime, ... }; }`
    - Export: `getGreeting`, `formatTime` (both greeting and timer variants), `formatDate`, `buildGreetingWithName`, `validateDuration`, `validateTaskText`, `validateLinkName`, `validateLinkUrl`, `generateId`, `addTask`, `editTask`, `toggleTask`, `deleteTask`, `loadTasks`, `saveTasks`, `addLink`, `deleteLink`, `loadLinks`, `saveLinks`
    - _Requirements: (enables all tests)_

  - [ ] 13.3 Create `tests/greeting.test.js` with unit tests and property tests for the Greeting module
    - Unit tests: correct default greeting on load with no Local Storage data; saving a valid name updates the display; empty/whitespace name shows the error span
    - Property tests: Properties 1, 3, 4 (tasks 4.2, 4.5, 4.6)
    - _Requirements: 1.1, 1.2, 2.1–2.4, 3.2, 3.3, 3.4, 3.6_

  - [ ] 13.4 Create `tests/timer.test.js` with unit tests and property tests for the Timer module
    - Unit tests: timer defaults to 25 minutes; start/stop/reset state transitions; audio rejection triggers visual notification
    - Property tests: Properties 2, 16, 17 (tasks 4.3, 6.2, 6.5)
    - _Requirements: 4.1–4.9, 5.1–5.6_

  - [ ] 13.5 Create `tests/tasks.test.js` with unit tests and property tests for the Task List module
    - Unit tests: cancel edit restores original text; Local Storage write failure shows error toast; page load with no saved tasks renders empty list
    - Property tests: Properties 5, 6, 7, 8, 9, 10 (tasks 8.2–8.8)
    - _Requirements: 6.2–6.6, 7.1–7.8, 8.1–8.3_

  - [ ] 13.6 Create `tests/links.test.js` with unit tests and property tests for the Quick Links module
    - Unit tests: clicking a link calls `window.open` with `"_blank"`; empty state renders no link buttons; Local Storage failure shows error toast
    - Property tests: Properties 11, 12, 13, 14 (tasks 10.2, 10.4, 10.5, 10.6)
    - _Requirements: 9.1–9.6, 10.1–10.2, 11.1–11.2_

  - [ ] 13.7 Create `tests/theme.test.js` with unit tests and property tests for the Theme module
    - Unit tests: `initTheme` defaults to `"light"` when nothing is saved; toggling twice returns to the original theme; button label updates on toggle
    - Property tests: Property 15 (task 3.2)
    - _Requirements: 12.1–12.5_

- [ ] 14. Final checkpoint — run all tests and verify the full app in the browser
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm test` and confirm all unit and property tests pass (100 iterations per property by default)
  - Open `index.html` in Chrome, Firefox, and Edge as a local file; verify all features work together without a build step

## Notes

- Tasks marked with `*` are optional — they are property-based tests that are great to add but can be skipped for a faster MVP build
- All core implementation tasks (no `*`) must be completed in order; they build directly on each other
- Each task references specific requirements for traceability
- Checkpoints at tasks 5, 7, 9, 11, and 14 let you verify progress in the browser as you go
- `initTheme()` MUST run before `DOMContentLoaded` — this is the only way to prevent a flash of the wrong theme
- Use event delegation on `#task-list` and `#links-grid` rather than per-element listeners — this is simpler and handles dynamically added items automatically
- All Local Storage writes use `try/catch` — private browsing mode and full storage quotas can both cause writes to fail silently otherwise
- Property tests use a minimum of 100 iterations each, tagged with `// Feature: todo-life-dashboard, Property N: ...`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 6, "tasks": ["4.5", "4.6", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "6.4"] },
    { "id": 8, "tasks": ["6.5", "6.6"] },
    { "id": 9, "tasks": ["8.1"] },
    { "id": 10, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 11, "tasks": ["8.5", "8.6", "8.7", "8.8", "8.9"] },
    { "id": 12, "tasks": ["10.1"] },
    { "id": 13, "tasks": ["10.2", "10.3"] },
    { "id": 14, "tasks": ["10.4", "10.5", "10.6", "10.7"] },
    { "id": 15, "tasks": ["12.1", "12.2"] },
    { "id": 16, "tasks": ["13.1"] },
    { "id": 17, "tasks": ["13.2"] },
    { "id": 18, "tasks": ["13.3", "13.4", "13.5", "13.6", "13.7"] }
  ]
}
```
