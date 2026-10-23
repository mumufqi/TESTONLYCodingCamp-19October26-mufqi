let app;
const mode = () => document.querySelector('[data-timer-mode][aria-pressed="true"]').getAttribute('data-timer-mode');
const display = () => document.getElementById('timer-display').textContent;
const progress = () => document.getElementById('pomodoro-progress').textContent;
function finish(minutes) {
  app.startTimer();
  jest.setSystemTime(Date.now() + minutes * 60000);
  app.tick();
}
function next() { document.getElementById('timer-next-btn').click(); }
beforeEach(() => {
  app = require('../js/app');
  app.initTimer();
});

test('a new cycle defaults to 25-minute Focus with all mode controls accessible', () => {
  expect(display()).toBe('25:00');
  expect(mode()).toBe('focus');
  expect(progress()).toBe('Focus completed: 0 of 4');
  expect(document.querySelectorAll('[data-timer-mode]')).toHaveLength(3);
  expect(document.getElementById('timer-next-btn').hidden).toBe(true);
});

test('Focus completion credits exactly one session and offers a five-minute break', () => {
  finish(25);
  expect(display()).toBe('00:00');
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(document.getElementById('timer-done-text').textContent).toContain('5-minute break');
  expect(document.getElementById('timer-next-btn').textContent).toBe('Start Short Break');
  expect(jest.getTimerCount()).toBe(0);
  app.tick();
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  next();
  expect(mode()).toBe('short');
  expect(display()).toBe('05:00');
  expect(jest.getTimerCount()).toBe(1);
});

test('short breaks finish without crediting focus and offer the next focus interval', () => {
  finish(25);
  next();
  finish(5);
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(document.getElementById('timer-next-btn').textContent).toBe('Start Focus');
  next();
  expect(mode()).toBe('focus');
  expect(display()).toBe('25:00');
});

test('four completed focus intervals lead to a 15-minute long break and a fresh cycle', () => {
  for (let completed = 1; completed <= 4; completed++) {
    expect(mode()).toBe('focus');
    finish(25);
    expect(progress()).toBe(`Focus completed: ${completed} of 4`);
    expect(document.getElementById('timer-next-btn').textContent).toBe(completed === 4 ? 'Start Long Break' : 'Start Short Break');
    next();
    if (completed < 4) {
      expect(mode()).toBe('short');
      finish(5);
      next();
    }
  }
  expect(mode()).toBe('long');
  expect(display()).toBe('15:00');
  finish(15);
  expect(progress()).toBe('Focus completed: 0 of 4');
  expect(document.getElementById('timer-next-btn').textContent).toBe('Start Focus');
  next();
  expect(mode()).toBe('focus');
  expect(display()).toBe('25:00');
});

test('Stop, Reset, and manual mode switches never count unfinished focus', () => {
  app.startTimer();
  jest.advanceTimersByTime(1500);
  app.stopTimer();
  expect(progress()).toBe('Focus completed: 0 of 4');
  app.resetTimer();
  expect(display()).toBe('25:00');
  document.querySelector('[data-timer-mode="short"]').click();
  expect(display()).toBe('05:00');
  document.querySelector('[data-timer-mode="long"]').click();
  expect(display()).toBe('15:00');
  document.querySelector('[data-timer-mode="focus"]').click();
  expect(progress()).toBe('Focus completed: 0 of 4');
});

test('break reset restores the active break duration and keeps completed focus sessions', () => {
  finish(25);
  next();
  jest.advanceTimersByTime(1500);
  app.resetTimer();
  expect(mode()).toBe('short');
  expect(display()).toBe('05:00');
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(jest.getTimerCount()).toBe(0);
});

test('Reset cycle clears progress and returns to a paused focus interval', () => {
  finish(25);
  next();
  document.getElementById('pomodoro-reset-cycle-btn').click();
  expect(mode()).toBe('focus');
  expect(progress()).toBe('Focus completed: 0 of 4');
  expect(display()).toBe('25:00');
  expect(jest.getTimerCount()).toBe(0);
  expect(document.getElementById('timer-done-msg').style.display).toBe('none');
});

test('custom duration changes only focus, while short and long breaks retain their lengths', () => {
  document.getElementById('timer-duration-input').value = '10';
  document.getElementById('timer-duration-submit').click();
  expect(display()).toBe('10:00');
  expect(document.getElementById('pomodoro-hint').textContent).toContain('10 min focus');
  app.setTimerMode('short');
  expect(display()).toBe('05:00');
  app.setTimerMode('long');
  expect(display()).toBe('15:00');
  app.setTimerMode('focus');
  expect(display()).toBe('10:00');
  expect(app.loadTimerDuration()).toBe(10);
});

test('a mode change stops its running predecessor without running two countdowns', () => {
  app.startTimer();
  app.setTimerMode('short');
  expect(jest.getTimerCount()).toBe(0);
  app.startTimer();
  expect(jest.getTimerCount()).toBe(1);
  jest.advanceTimersByTime(1000);
  expect(display()).toBe('04:59');
});

test('reload preserves finished-session progress and pending break without replaying the alarm', () => {
  finish(25);
  jest.resetModules();
  app = require('../js/app');
  app.initTimer();
  expect(display()).toBe('00:00');
  expect(mode()).toBe('focus');
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(document.getElementById('timer-next-btn').textContent).toBe('Start Short Break');
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

test('reload keeps the selected break and progress but restarts the interval paused', () => {
  finish(25);
  next();
  jest.advanceTimersByTime(1000);
  app.stopTimer();
  jest.resetModules();
  app = require('../js/app');
  app.initTimer();
  expect(mode()).toBe('short');
  expect(display()).toBe('05:00');
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(jest.getTimerCount()).toBe(0);
});

test.each([
  'invalid JSON', 'null', '[]',
  JSON.stringify({ version: 1, mode: '__proto__', completed: 0, next: null }),
  JSON.stringify({ version: 1, mode: 'focus', completed: -1, next: null }),
  JSON.stringify({ version: 1, mode: 'focus', completed: 1.5, next: null }),
  JSON.stringify({ version: 1, mode: 'focus', completed: 5, next: null }),
  JSON.stringify({ version: 1, mode: 'focus', completed: 0, next: 'long' })
])('malformed progress %s falls back safely to a fresh focus cycle', saved => {
  localStorage.setItem('dashboard_pomodoro_progress', saved);
  app.initTimer();
  expect(mode()).toBe('focus');
  expect(display()).toBe('25:00');
  expect(progress()).toBe('Focus completed: 0 of 4');
});

test('unknown mode values cannot change or interrupt the active countdown', () => {
  app.startTimer();
  expect(app.setTimerMode('__proto__')).toBe(false);
  expect(app.setTimerMode('unknown')).toBe(false);
  expect(jest.getTimerCount()).toBe(1);
  expect(mode()).toBe('focus');
});

test('delayed callbacks count one completed focus, never skipped background sessions', () => {
  finish(180);
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(display()).toBe('00:00');
  expect(jest.getTimerCount()).toBe(0);
});

test('blocked storage warns the user while the cycle still works for this session', () => {
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  finish(25);
  expect(progress()).toBe('Focus completed: 1 of 4');
  expect(document.getElementById('storage-error-toast').textContent).toContain('Pomodoro progress');
  next();
  expect(mode()).toBe('short');
  expect(display()).toBe('05:00');
});
