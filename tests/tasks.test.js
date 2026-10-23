const fc = require('fast-check');
const text = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const list = fc.array(text, { minLength: 1, maxLength: 8 });
let app;
beforeEach(() => { app = require('../js/app'); });
function seed(values = []) {
  localStorage.removeItem('dashboard_tasks');
  app.loadTasks();
  values.forEach(value => app.addTask(value));
  return app.loadTasks();
}

// Feature: todo-life-dashboard, Property 5: Valid task addition grows the list
test('Property 5: valid task addition adds exactly one item to any existing list', () => {
  fc.assert(fc.property(list, text, (values, value) => {
    const before = seed(values);
    expect(app.addTask(value)).toBe(true);
    const after = app.loadTasks();
    expect(after.slice(0, -1)).toEqual(before);
    expect(after).toHaveLength(before.length + 1);
    expect(after.at(-1)).toEqual({ id: expect.any(String), text: value.trim(), completed: false });
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 6: Invalid task names are rejected
test('Property 6: whitespace and oversized names cannot mutate tasks', () => {
  fc.assert(fc.property(fc.oneof(fc.stringOf(fc.constantFrom(' ', '\t', '\n')), fc.integer({ min: 101, max: 300 }).map(n => 'x'.repeat(n))), value => {
    const before = seed(['Keep me']);
    expect(app.addTask(value)).toBe(false);
    expect(app.loadTasks()).toEqual(before);
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 7: Task add-load round trip
test('Property 7: task data survives serialization and restoration', () => {
  fc.assert(fc.property(list, values => {
    const expected = seed(values);
    app.saveTasks();
    expect(JSON.parse(localStorage.getItem('dashboard_tasks'))).toEqual(expected);
    expect(app.loadTasks()).toEqual(expected);
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 8: Toggle completion is self-inverse
test('Property 8: toggling twice restores the full original list', () => {
  fc.assert(fc.property(list, fc.nat(), fc.boolean(), (values, n, completed) => {
    let before = seed(values);
    const id = before[n % before.length].id;
    if (completed) app.toggleTask(id);
    before = app.loadTasks();
    app.toggleTask(id);
    app.toggleTask(id);
    expect(app.loadTasks()).toEqual(before);
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 9: Task deletion removes only the target
test('Property 9: deletion preserves all untargeted tasks and their order', () => {
  fc.assert(fc.property(list, fc.nat(), (values, n) => {
    const before = seed(values);
    const id = before[n % before.length].id;
    app.deleteTask(id);
    expect(app.loadTasks()).toEqual(before.filter(task => task.id !== id));
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 10: Task edits persist new text
test('Property 10: edits persist and affect only their target', () => {
  fc.assert(fc.property(list, text, fc.nat(), (values, replacement, n) => {
    const before = seed(values);
    const id = before[n % before.length].id;
    expect(app.editTask(id, replacement)).toBe(true);
    expect(app.loadTasks()).toEqual(before.map(task => task.id === id ? { ...task, text: replacement.trim() } : task));
  }), { numRuns: 100 });
});

test('delegated add, edit, invalid save, cancel, complete, and delete work through the DOM', () => {
  app.initTasks();
  const input = document.getElementById('task-input');
  input.value = 'Original';
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(input.value).toBe('');
  document.querySelector('.task-edit-btn').click();
  document.querySelector('.task-edit-input').value = '  ';
  document.querySelector('.task-save-btn').click();
  expect(document.querySelector('.task-inline-error').textContent).not.toBe('');
  expect(app.loadTasks()[0].text).toBe('Original');
  document.querySelector('.task-cancel-btn').click();
  expect(document.querySelector('.task-text').textContent).toBe('Original');
  document.querySelector('.task-edit-btn').click();
  document.querySelector('.task-edit-input').value = 'Edited';
  document.querySelector('.task-save-btn').click();
  document.querySelector('.task-checkbox').click();
  expect(document.querySelector('.task-text').classList.contains('completed')).toBe(true);
  expect(app.loadTasks()[0]).toMatchObject({ text: 'Edited', completed: true });
  document.querySelector('.task-delete-btn').click();
  expect(app.loadTasks()).toEqual([]);
  expect(document.querySelectorAll('#task-list li')).toHaveLength(0);
});

test('task text is rendered literally, never as executable HTML', () => {
  app.addTask('<img src=x onerror=alert(1)>');
  expect(document.querySelector('#task-list img')).toBeNull();
  expect(document.querySelector('.task-text').textContent).toBe('<img src=x onerror=alert(1)>');
});

test.each(['[null]', '{"text":"wrong container"}', 'not JSON'])('corrupt task data %s does not break initialization', value => {
  localStorage.setItem('dashboard_tasks', value);
  expect(() => app.initTasks()).not.toThrow();
  expect(document.querySelectorAll('#task-list li')).toHaveLength(0);
});

test('mixed saved tasks retain valid records and reject duplicate IDs', () => {
  const valid = { id: 'one', text: 'Keep', completed: false };
  localStorage.setItem('dashboard_tasks', JSON.stringify([null, valid, valid, { id: 'two', text: 'Bad', completed: 'false' }]));
  expect(app.loadTasks()).toEqual([valid]);
});

test('blocked storage shows a toast while keeping session tasks usable', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  app.addTask('Unsaved task');
  expect(document.querySelector('.task-text').textContent).toBe('Unsaved task');
  expect(document.getElementById('storage-error-toast').style.display).toBe('block');
  jest.advanceTimersByTime(3000);
  expect(document.getElementById('storage-error-toast').style.display).toBe('none');
});

test('malformed task data does not prevent the other dashboard widgets from starting', () => {
  localStorage.setItem('dashboard_tasks', '[null]');
  app.initDashboard();
  document.getElementById('link-name-input').value = 'Example';
  document.getElementById('link-url-input').value = 'https://example.com';
  document.getElementById('link-add-btn').click();
  expect(document.querySelector('#links-grid a').textContent).toBe('Example');
});
