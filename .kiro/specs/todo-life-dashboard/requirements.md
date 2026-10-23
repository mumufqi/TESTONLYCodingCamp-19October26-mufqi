# Requirements Document

## Introduction

The To-do List Life Dashboard is a simple, single-page website that helps users organize their day. It displays the current time and date with a personalized greeting, a Pomodoro focus timer, a to-do list, and quick-access links to favorite websites. The entire app runs in the browser with no server needed — all data is saved using the browser's Local Storage. It can be opened directly as an HTML file or used as a browser homepage. The interface is clean and beginner-friendly, with an optional light/dark mode toggle.

## Glossary

- **Dashboard**: The main webpage that shows all features together on one screen.
- **Greeting_Widget**: The section of the Dashboard that shows the current time, date, and a welcome message.
- **Timer**: The Pomodoro-style countdown timer shown on the Dashboard.
- **Task_List**: The section of the Dashboard where users manage their to-do items.
- **Task**: A single to-do item that the user adds to the Task_List.
- **Quick_Links**: The section of the Dashboard that shows clickable buttons linking to favorite websites.
- **Link**: A single saved website shortcut shown in the Quick_Links section.
- **Local_Storage**: The browser's built-in storage system used to save data on the user's device without a server.
- **Theme**: The visual color mode of the Dashboard, either light or dark.
- **User**: The person using the Dashboard in their web browser.

---

## Requirements

### Requirement 1: Display Current Time and Date

**User Story:** As a User, I want to see the current time and date when I open the Dashboard, so that I always know what day and time it is without checking my phone.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in hours and minutes format (e.g., 09:45 AM) based on the user's local system timezone.
2. THE Greeting_Widget SHALL display the current date including the day of the week, month, and year (e.g., Monday, July 14, 2025) based on the user's local system timezone.
3. WHILE the page is open, THE Greeting_Widget SHALL update the displayed time every 60 seconds, reflecting the current local system time at the moment of each update.
4. WHILE the page is open, THE Greeting_Widget SHALL update the displayed date whenever the calendar date changes, ensuring the date shown always matches the current local system date.

---

### Requirement 2: Show a Time-Based Greeting

**User Story:** As a User, I want to see a friendly greeting based on the time of day, so that the Dashboard feels personal and welcoming.

#### Acceptance Criteria

1. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display "Good Morning".
2. WHEN the local time is between 12:00 and 16:59, THE Greeting_Widget SHALL display "Good Afternoon".
3. WHEN the local time is between 17:00 and 20:59, THE Greeting_Widget SHALL display "Good Evening".
4. WHEN the local time is between 21:00 and 04:59, THE Greeting_Widget SHALL display "Good Night".
5. WHEN the clock crosses a time-period boundary (e.g., 11:59 to 12:00), THE Greeting_Widget SHALL update the greeting text without requiring a page reload.
6. IF the device's local time is unavailable, THEN THE Greeting_Widget SHALL display a fallback greeting of "Hello".

---

### Requirement 3: Personalized Greeting with Custom Name

**User Story:** As a User, I want to enter my name so that the greeting addresses me personally (e.g., "Good Morning, Alex!").

#### Acceptance Criteria

1. THE Greeting_Widget SHALL provide an input field where the User can type their name, accepting between 1 and 50 characters.
2. WHEN the User clicks a save button or presses the Enter key with a valid name (1–50 characters, trimmed), THE Greeting_Widget SHALL display the greeting with the trimmed saved name appended (e.g., "Good Morning, Alex!").
3. WHEN the User saves a valid name, THE Dashboard SHALL store the trimmed name in Local_Storage so it persists after the browser is closed and reopened.
4. WHEN the page loads and a non-empty saved name exists in Local_Storage, THE Greeting_Widget SHALL load and display the saved name automatically.
5. IF the User has not saved a name, THEN THE Greeting_Widget SHALL display the greeting without a name (e.g., "Good Morning!").
6. IF the User attempts to save an empty or whitespace-only name, THEN THE Greeting_Widget SHALL display an error message and SHALL NOT overwrite any existing stored name.

---

### Requirement 4: Pomodoro Focus Timer

**User Story:** As a User, I want a countdown timer so that I can focus on a task for a set amount of time without distraction.

#### Acceptance Criteria

1. THE Timer SHALL display a countdown in minutes and seconds format (MM:SS), where MM is zero-padded to 2 digits and SS is zero-padded to 2 digits.
2. THE Timer SHALL default to a duration of 25 minutes when the page first loads.
3. WHEN the User clicks the Start button, THE Timer SHALL begin counting down one second at a time from its current displayed value.
4. WHEN the User clicks the Stop button, THE Timer SHALL pause the countdown and retain the current displayed value.
5. WHEN the User clicks the Reset button, THE Timer SHALL stop the countdown and restore the display to the current configured duration (defaulting to 25:00 if no custom duration has been set).
6. WHEN the Timer countdown reaches 00:00, THE Timer SHALL play an audible alert sound with a minimum duration of 1 second to notify the User that the session has ended.
7. IF the Timer countdown reaches 00:00 and the browser cannot play audio, THEN THE Timer SHALL display a visible notification indicating the session has ended.
8. WHEN the Timer countdown reaches 00:00, THE Timer SHALL stop counting and display 00:00.
9. WHEN the User sets a custom duration between 1 minute and 99 minutes, THE Timer SHALL update the configured duration and reset the display to the new value in MM:SS format.

---

### Requirement 5: Customizable Timer Duration

**User Story:** As a User, I want to set a custom timer duration, so that I can adjust my focus sessions to fit my personal work style.

#### Acceptance Criteria

1. THE Timer SHALL provide an input field where the User can enter a custom duration in minutes.
2. WHEN the User confirms a custom duration by pressing Enter or activating the submit control, THE Timer SHALL update its countdown display to reflect the new duration.
3. WHEN the User confirms a new duration, THE Timer SHALL save the custom duration to Local_Storage so it persists after the browser is closed and reopened.
4. WHEN the page loads and a saved duration exists in Local_Storage and is a valid number between 1 and 120, THE Timer SHALL load and display that saved duration.
5. IF the User enters a duration less than 1 minute or greater than 120 minutes, THEN THE Timer SHALL display a validation message indicating the allowed range (1–120 minutes) and keep the previous valid duration.
6. IF Local_Storage is unavailable or contains no saved duration, THEN THE Timer SHALL default to 25 minutes.

---

### Requirement 6: Add Tasks to the To-Do List

**User Story:** As a User, I want to add tasks to a list, so that I can keep track of everything I need to do today.

#### Acceptance Criteria

1. THE Task_List SHALL provide a text input field and an "Add" button for entering new tasks.
2. WHEN the User types a task name of 1 to 100 characters and clicks the Add button, THE Task_List SHALL add the new Task to the list and display it on screen, and SHALL clear the text input field.
3. WHEN the User types a task name of 1 to 100 characters and presses the Enter key, THE Task_List SHALL add the new Task to the list and SHALL clear the text input field.
4. WHEN a new Task is added, THE Dashboard SHALL save the updated Task_List to Local_Storage.
5. IF the User attempts to add a task whose name is empty or contains only whitespace characters, THEN THE Task_List SHALL not add the Task and SHALL display a validation message near the input field indicating that the task name cannot be empty.
6. IF the User attempts to add a task whose name exceeds 100 characters, THEN THE Task_List SHALL not add the Task and SHALL display a validation message near the input field indicating the character limit.

---

### Requirement 7: Manage Tasks (Edit, Complete, Delete)

**User Story:** As a User, I want to edit, mark as done, and delete tasks, so that I can keep my to-do list accurate and up to date.

#### Acceptance Criteria

1. THE Task_List SHALL display an "Edit" button, a complete checkbox, and a "Delete" button next to each Task.
2. WHEN the User clicks the Edit button on a Task, THE Task_List SHALL replace that Task's text with an editable input field pre-filled with the current Task text, and a "Save" button and a "Cancel" button.
3. WHEN the User clicks the Save button while editing a Task, THE Task_List SHALL accept the updated text only if it is between 1 and 100 characters, update the Task's displayed text, and THE Dashboard SHALL persist the updated Task to Local_Storage.
4. IF the User submits an edit with text that is empty or exceeds 100 characters, THEN THE Task_List SHALL display an error message indicating the text length requirement and retain the input field in its current state without saving.
5. WHEN the User clicks the Cancel button while editing a Task, THE Task_List SHALL discard the changes and restore the Task's original text without updating Local_Storage.
6. WHEN the User clicks the complete checkbox on an incomplete Task, THE Task_List SHALL apply strikethrough styling to the Task's text and THE Dashboard SHALL update the Task's status to complete in Local_Storage.
7. WHEN the User clicks the complete checkbox on a completed Task, THE Task_List SHALL remove the strikethrough styling from the Task's text and THE Dashboard SHALL update the Task's status to incomplete in Local_Storage.
8. WHEN the User clicks the Delete button on a Task, THE Task_List SHALL immediately remove that Task from the displayed list and THE Dashboard SHALL remove that Task from Local_Storage.

---

### Requirement 8: Persist Tasks Across Sessions

**User Story:** As a User, I want my tasks to be saved automatically, so that they are still there when I close and reopen the browser.

#### Acceptance Criteria

1. WHEN the page loads, THE Task_List SHALL read all saved tasks from Local_Storage and display them on screen.
2. WHEN a Task is added, edited, completed, or deleted, THE Dashboard SHALL immediately save the updated Task_List to Local_Storage.
3. IF a Local_Storage write fails, THEN THE Dashboard SHALL display a brief error message to the User indicating that the change could not be saved.

---

### Requirement 9: Add Quick Links

**User Story:** As a User, I want to save links to my favorite websites, so that I can open them quickly from my Dashboard without searching.

#### Acceptance Criteria

1. THE Quick_Links section SHALL provide an input field for a Link name (1–50 characters) and an input field for a Link URL (starting with http:// or https://), and an "Add Link" button.
2. WHEN the User provides a valid name and a valid URL and clicks Add Link, THE Quick_Links section SHALL display the new Link as a clickable button labeled with the saved name.
3. WHEN the User clicks a Link button, THE Dashboard SHALL open the saved URL in a new browser tab.
4. WHEN a new Link is added, THE Dashboard SHALL save the updated Quick_Links list to Local_Storage.
5. IF the User attempts to add a Link with an empty name, a name exceeding 50 characters, or a URL that does not start with http:// or https://, THEN THE Quick_Links section SHALL not add the Link and SHALL display a validation message indicating which field failed validation.
6. THE Quick_Links section SHALL support saving up to 20 links; IF the User attempts to add a link when 20 links already exist, THEN THE Quick_Links section SHALL display a message indicating the maximum limit has been reached.

---

### Requirement 10: Delete Quick Links

**User Story:** As a User, I want to remove quick links I no longer need, so that my Dashboard stays organized.

#### Acceptance Criteria

1. THE Quick_Links section SHALL display a "Delete" button next to each saved Link.
2. WHEN the User clicks the Delete button on a Link, THE Quick_Links section SHALL remove that Link from the display and THE Dashboard SHALL update the Quick_Links list in Local_Storage to remove the deleted Link.

---

### Requirement 11: Persist Quick Links Across Sessions

**User Story:** As a User, I want my quick links to be saved automatically, so that they are still there when I reopen the browser.

#### Acceptance Criteria

1. WHEN the page loads, THE Quick_Links section SHALL read all saved links from Local_Storage and display each link as a clickable button labeled with the saved name.
2. IF Local_Storage is unavailable or contains no saved links on page load, THEN THE Quick_Links section SHALL display an empty state with no link buttons shown.

---

### Requirement 12: Light and Dark Mode Toggle

**User Story:** As a User, I want to switch between a light and dark color theme, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL display a toggle button that switches between light mode and dark mode.
2. WHEN the User clicks the toggle button, THE Dashboard SHALL apply the selected Theme to all visible elements within 100ms (one rendering frame).
3. WHEN the User selects a Theme, THE Dashboard SHALL save the Theme preference to Local_Storage.
4. WHEN the page loads, THE Dashboard SHALL read the saved Theme preference from Local_Storage and apply it before any content is rendered, preventing a flash of the wrong theme.
5. IF no Theme preference is saved in Local_Storage, THEN THE Dashboard SHALL default to light mode on page load.

---

### Requirement 13: Single-File Code Structure

**User Story:** As a beginner developer, I want the project to use simple, separate files for HTML, CSS, and JavaScript, so that I can find and understand each part of the code easily.

#### Acceptance Criteria

1. THE Dashboard SHALL be structured with exactly one HTML file as the entry point (e.g., index.html).
2. THE Dashboard SHALL use exactly one CSS file located inside a css/ folder for all styling.
3. THE Dashboard SHALL use exactly one JavaScript file located inside a js/ folder for all interactive behavior.
4. THE Dashboard SHALL load and operate without errors in modern browsers (Chrome, Firefox, Edge, Safari) when opened as a local file or served from a static host, without requiring a local server or build step.
