const fc = require('fast-check');
const name = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
const url = fc.webUrl();
let app;
beforeEach(() => { app = require('../js/app'); });
function seed(values = []) {
  localStorage.removeItem('dashboard_links');
  app.loadLinks();
  values.forEach(value => app.addLink(value.name, value.url));
  return app.loadLinks();
}

// Feature: todo-life-dashboard, Property 11: URL validation
test('Property 11: real HTTP(S) URLs are accepted and executable protocols are rejected', () => {
  fc.assert(fc.property(url, fc.string(), (value, arbitrary) => {
    expect(app.validateLinkUrl(value)).toBe(true);
    for (const prefix of ['javascript:', 'data:', 'file:', 'ftp://']) {
      expect(app.validateLinkUrl(prefix + arbitrary)).toBe(false);
    }
  }), { numRuns: 100 });
});

test.each(['https://', 'http://', 'https:///missing-host', '//example.com', 'example.com', 'https://bad host.com', 'https://exa\nmple.com'])('malformed URL %s is rejected', value => {
  expect(app.validateLinkUrl(value)).toBe(false);
  expect(app.addLink('Invalid', value)).toBe(false);
  expect(app.loadLinks()).toEqual([]);
});

// Feature: todo-life-dashboard, Property 12: Valid link addition grows the list
test('Property 12: adding a valid link preserves existing links and persists one new item', () => {
  fc.assert(fc.property(fc.array(fc.record({ name, url }), { maxLength: 19 }), name, url, (values, label, value) => {
    const before = seed(values);
    expect(app.addLink(label, value)).toBe(true);
    const after = app.loadLinks();
    expect(after.slice(0, -1)).toEqual(before);
    expect(after).toHaveLength(before.length + 1);
    expect(after.at(-1)).toMatchObject({ name: label.trim(), url: value.trim() });
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 13: Links list never exceeds 20
test('Property 13: arbitrary addition sequences stop at 20 persisted links', () => {
  fc.assert(fc.property(fc.array(fc.record({ name, url }), { minLength: 21, maxLength: 25 }), values => {
    const saved = seed(values);
    expect(saved).toHaveLength(20);
    expect(document.querySelectorAll('#links-grid a')).toHaveLength(20);
    expect(document.getElementById('link-error').textContent).toContain('20');
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 14: Link deletion removes only the target
test('Property 14: deletion removes only its target and survives reload', () => {
  fc.assert(fc.property(fc.array(fc.record({ name, url }), { minLength: 1, maxLength: 8 }), fc.nat(), (values, n) => {
    const before = seed(values);
    const id = before[n % before.length].id;
    app.deleteLink(id);
    app.saveLinks();
    expect(app.loadLinks()).toEqual(before.filter(link => link.id !== id));
  }), { numRuns: 100 });
});

test('DOM controls add safe new-tab anchors and delete via event delegation', () => {
  app.initLinks();
  document.getElementById('link-name-input').value = 'GitHub';
  document.getElementById('link-url-input').value = 'https://github.com';
  document.getElementById('link-name-input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  const anchor = document.querySelector('#links-grid a');
  expect(anchor.href).toBe('https://github.com/');
  expect(anchor.target).toBe('_blank');
  expect(anchor.rel).toBe('noopener noreferrer');
  expect(document.getElementById('link-name-input').value).toBe('');
  document.querySelector('.link-delete-btn').click();
  expect(app.loadLinks()).toEqual([]);
});

test('saved links reject unsafe URLs, malformed entries, and duplicate IDs', () => {
  const valid = { id: 'ok', name: 'Example', url: 'https://example.com' };
  localStorage.setItem('dashboard_links', JSON.stringify([null, valid, valid, { id: 'bad', name: 'Unsafe', url: 'javascript:alert(1)' }]));
  app.initLinks();
  expect(app.loadLinks()).toEqual([valid]);
  expect(document.querySelectorAll('#links-grid a')).toHaveLength(1);
});

test('saved lists are capped at 20 even when storage is edited externally', () => {
  localStorage.setItem('dashboard_links', JSON.stringify(Array.from({ length: 22 }, (_, n) => ({ id: String(n), name: 'Example', url: 'https://example.com' }))));
  expect(app.loadLinks()).toHaveLength(20);
});

test('empty and corrupt link storage produces an empty state without crashing', () => {
  app.initLinks();
  expect(document.querySelectorAll('#links-grid a')).toHaveLength(0);
  localStorage.setItem('dashboard_links', 'bad JSON');
  expect(app.loadLinks()).toEqual([]);
});

test('link storage failure shows a warning without losing in-session links', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  app.addLink('Example', 'https://example.com');
  expect(document.querySelector('#links-grid a').textContent).toBe('Example');
  expect(document.getElementById('storage-error-toast').style.display).toBe('block');
});
