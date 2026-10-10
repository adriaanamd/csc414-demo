import '@testing-library/jest-dom/vitest';

// Polyfill window.matchMedia for JSDOM test environments
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
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

  // Fallback for localStorage if not defined in environment
  if (!window.localStorage) {
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      configurable: true,
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = String(value);
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          for (const key of Object.keys(store)) {
            delete store[key];
          }
        },
        get length() {
          return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
      },
    });
  }
}
