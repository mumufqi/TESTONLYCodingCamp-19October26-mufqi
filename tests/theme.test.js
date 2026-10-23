const fc = require('fast-check');
let app;
beforeEach(() => { app = require('../js/app'); });

// Feature: todo-life-dashboard, Property 15: Theme save-load round trip
test('Property 15: theme toggles persist and restore the chosen theme', () => {
  fc.assert(fc.property(fc.constantFrom('light', 'dark'), theme => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
    app.toggleTheme();
    expect(localStorage.getItem('dashboard_theme')).toBe(theme);
    document.documentElement.setAttribute('data-theme', 'unset');
    app.initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
  }), { numRuns: 100 });
});

test('theme defaults to light, handles invalid storage, and updates the button', () => {
  localStorage.setItem('dashboard_theme', 'invalid');
  app.initTheme();
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  app.toggleTheme();
  expect(document.getElementById('theme-toggle-btn').textContent).toContain('Light Mode');
  app.toggleTheme();
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});

test('theme still changes when storage is blocked and shows a warning', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  app.toggleTheme();
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(document.getElementById('storage-error-toast').style.display).toBe('block');
});

test('requiring the module has no initialization side effects', () => {
  expect(jest.getTimerCount()).toBe(0);
  expect(document.getElementById('time-text').textContent).toBe('');
});

test('dashboard initializes once and the theme button toggles once per click', () => {
  app.initTheme();
  app.initDashboard();
  app.initDashboard();
  document.getElementById('theme-toggle-btn').click();
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(document.getElementById('time-text').textContent).toBe('09:45 AM');
  expect(jest.getTimerCount()).toBe(1);
});
