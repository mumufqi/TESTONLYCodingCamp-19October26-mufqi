const fc = require('fast-check');
let app;
const display = () => document.getElementById('timer-display').textContent;
const setDuration = value => {
  document.getElementById('timer-duration-input').value = String(value);
  document.getElementById('timer-duration-submit').click();
};
beforeEach(() => { app = require('../js/app'); });

// Feature: todo-life-dashboard, Property 2: Timer formatTime output is valid MM:SS
test('Property 2: timer formatting preserves all seconds, including 3-digit minutes', () => {
  fc.assert(fc.property(fc.integer({ min: 0, max: 7200 }), seconds => {
    const result = app.timerFormatTime(seconds);
    expect(result).toMatch(/^\d{2,3}:\d{2}$/);
    const [minutes, remainder] = result.split(':').map(Number);
    expect(minutes * 60 + remainder).toBe(seconds);
    expect(remainder).toBeLessThan(60);
  }), { numRuns: 100 });
});

// Feature: todo-life-dashboard, Property 16: Timer duration validation
test('Property 16: only integer durations in range are accepted', () => {
  fc.assert(fc.property(fc.oneof(fc.integer({ min: -1000, max: 1000 }), fc.double(), fc.string()), value => {
    expect(app.validateDuration(value)).toBe(Number.isInteger(value) && value >= 1 && value <= 120);
  }), { numRuns: 100 });
});

test('default timer supports start, duplicate start, pause, resume, and reset', () => {
  app.initTimer();
  expect(display()).toBe('25:00');
  document.getElementById('timer-start-btn').click();
  document.getElementById('timer-start-btn').click();
  expect(jest.getTimerCount()).toBe(1);
  jest.advanceTimersByTime(1500);
  document.getElementById('timer-stop-btn').click();
  expect(display()).toBe('24:59');
  jest.advanceTimersByTime(5000);
  expect(display()).toBe('24:59');
  app.startTimer();
  jest.advanceTimersByTime(500);
  expect(display()).toBe('24:58');
  document.getElementById('timer-reset-btn').click();
  expect(display()).toBe('25:00');
  expect(jest.getTimerCount()).toBe(0);
});

test.each(['2.5', '120.9', '', '0', '121'])('duration input rejects %s without changing the timer', value => {
  app.initTimer();
  setDuration(value);
  expect(display()).toBe('25:00');
  expect(document.getElementById('timer-duration-error').textContent).not.toBe('');
  expect(localStorage.getItem('dashboard_timer_duration')).toBeNull();
});

test('Enter sets duration and a later initialization restores it', () => {
  app.initTimer();
  const input = document.getElementById('timer-duration-input');
  input.value = '3';
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(display()).toBe('03:00');
  expect(app.loadTimerDuration()).toBe(3);
  app.initTimer();
  expect(display()).toBe('03:00');
  expect(document.getElementById('timer-duration-input').value).toBe('3');
});

test.each(['2.5', '25junk', '', '-1', '121'])('invalid stored duration %s falls back to 25', value => {
  localStorage.setItem('dashboard_timer_duration', value);
  expect(app.loadTimerDuration()).toBe(25);
});

test('timer catches up after delayed callbacks and completion is announced once', () => {
  app.initTimer();
  setDuration(1);
  app.startTimer();
  jest.setSystemTime(Date.now() + 60000);
  app.tick();
  expect(display()).toBe('00:00');
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  app.tick();
  app.startTimer();
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  expect(document.getElementById('timer-done-msg').style.display).toBe('block');
});

// Feature: todo-life-dashboard, Property 17: Timer never goes below zero
test('Property 17: completed timers remain zero after arbitrary additional ticks', () => {
  app.initTimer();
  fc.assert(fc.property(fc.integer({ min: 1, max: 50 }), count => {
    setDuration(1);
    app.startTimer();
    jest.setSystemTime(Date.now() + 60000);
    app.tick();
    const plays = HTMLMediaElement.prototype.play.mock.calls.length;
    for (let i = 0; i < count; i++) app.tick();
    expect(display()).toBe('00:00');
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(plays);
  }), { numRuns: 100 });
});

test('blocked audio still leaves the completion message visible', async () => {
  HTMLMediaElement.prototype.play.mockRejectedValue(new Error('autoplay blocked'));
  app.initTimer();
  setDuration(1);
  app.startTimer();
  jest.advanceTimersByTime(60000);
  await Promise.resolve();
  expect(document.getElementById('timer-done-msg').style.display).toBe('block');
  app.resetTimer();
  expect(document.getElementById('timer-done-msg').style.display).toBe('none');
});

test('alarm contains at least one second of PCM audio', () => {
  const AudioClass = window.Audio;
  const create = jest.spyOn(window, 'Audio').mockImplementation(src => {
    const bytes = Buffer.from(src.split(',')[1], 'base64');
    expect(bytes.readUInt32LE(4) + 8).toBe(bytes.length);
    expect(bytes.readUInt32LE(40) / bytes.readUInt32LE(28)).toBeGreaterThanOrEqual(1);
    return new AudioClass();
  });
  app.handleTimerEnd();
  expect(create).toHaveBeenCalledTimes(1);
});

test('duration storage failure is visible while the timer remains usable', () => {
  app.initTimer();
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  setDuration(5);
  expect(display()).toBe('05:00');
  expect(document.getElementById('storage-error-toast').style.display).toBe('block');
});
