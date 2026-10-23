const fc = require('fast-check');
let app;
beforeEach(() => { app = require('../js/app'); });

// Feature: todo-life-dashboard, Property 1: Greeting maps hours to correct string
test('Property 1: greeting boundaries agree with all valid hours', () => {
  fc.assert(fc.property(fc.integer({ min: 0, max: 23 }), hour => {
    const expected = hour < 5 || hour >= 21 ? 'Good Night' :
      hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    expect(app.getGreeting(hour)).toBe(expected);
  }), { numRuns: 100 });
});

test.each([-1, 24, 5.5, NaN, Infinity, 'noon', null])('invalid hour %s uses fallback', hour => {
  expect(app.getGreeting(hour)).toBe('Hello');
});

test('initial clock, date, and greeting reflect local time and refresh at a boundary', () => {
  jest.setSystemTime(new Date(2026, 9, 23, 11, 59));
  app.initGreeting();
  expect(document.getElementById('time-text').textContent).toBe('11:59 AM');
  expect(document.getElementById('date-text').textContent).toBe('Friday, October 23, 2026');
  expect(document.getElementById('greeting-text').textContent).toBe('Good Morning!');
  jest.advanceTimersByTime(60000);
  expect(document.getElementById('greeting-text').textContent).toBe('Good Afternoon!');
  expect(document.getElementById('time-text').textContent).toBe('12:00 PM');
});

test('the displayed date rolls over at midnight', () => {
  jest.setSystemTime(new Date(2026, 9, 23, 23, 59));
  app.initGreeting();
  jest.advanceTimersByTime(60000);
  expect(document.getElementById('date-text').textContent).toBe('Saturday, October 24, 2026');
  expect(document.getElementById('time-text').textContent).toBe('12:00 AM');
});

// Feature: todo-life-dashboard, Property 3: Whitespace names are rejected
test('Property 3: whitespace cannot replace a saved name', () => {
  fc.assert(fc.property(fc.stringOf(fc.constantFrom(' ', '\t', '\n')), name => {
    app.saveName('Alex');
    expect(app.saveName(name)).toBe(false);
    expect(app.loadName()).toBe('Alex');
    expect(document.getElementById('name-error').textContent).not.toBe('');
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 4: Name save-load round trip
test('Property 4: valid names persist trimmed and render as text', () => {
  fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), name => {
    expect(app.saveName(name)).toBe(true);
    expect(app.loadName()).toBe(name.trim());
    expect(document.getElementById('greeting-text').textContent).toBe(`Good Morning, ${name.trim()}!`);
  }), { numRuns: 100 });
});

test('Save and Enter update the name; oversized names preserve the previous value', () => {
  app.initGreeting();
  const input = document.getElementById('name-input');
  input.value = ' Alice ';
  document.getElementById('name-save-btn').click();
  expect(app.loadName()).toBe('Alice');
  input.value = 'Bob';
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(app.loadName()).toBe('Bob');
  expect(app.saveName('x'.repeat(51))).toBe(false);
  expect(app.loadName()).toBe('Bob');
});

test('name storage failure leaves usable session state and warns the user', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  app.saveName('Alex');
  expect(document.getElementById('greeting-text').textContent).toContain('Alex');
  expect(document.getElementById('storage-error-toast').style.display).toBe('block');
});
