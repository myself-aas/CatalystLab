import '@testing-library/jest-dom';

// Vitest is never production. Allow unauthenticated demo surfaces so the
// route suite can exercise GitHub/notifications without Firebase Admin.
if (process.env.NODE_ENV === 'test') {
  process.env.ALLOW_UNAUTH_DEMO = process.env.ALLOW_UNAUTH_DEMO || 'true';
}

// Suppress known non-fatal test warnings (act updates from async firebase auth listener, react-router flags)
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('not wrapped in act(...)') || args[0].includes('inside a test was not wrapped in act'))
  ) {
    return;
  }
  originalError(...args);
};

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React Router Future Flag Warning')
  ) {
    return;
  }
  originalWarn(...args);
};

// Polyfills and mocks for DOM test environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as any;

  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = MockIntersectionObserver as any;

  window.scrollTo = () => {};

  // Mock HTMLMediaElement methods
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.load = () => {};

  // Mock HTMLCanvasElement
  window.HTMLCanvasElement.prototype.getContext = () => null;
}
