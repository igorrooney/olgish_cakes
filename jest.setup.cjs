/* eslint-disable no-undef */
require('@testing-library/jest-dom');

const { TextDecoder, TextEncoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Guard against real network calls in tests.
// Individual tests should mock global.fetch when needed.
global.fetch = jest.fn(() => {
  throw new Error('Unexpected fetch call in test. Mock global.fetch in the test.')
})

// Minimal Web API stubs for Next.js server modules in Jest
if (typeof global.Request === 'undefined') {
  global.Request = class Request {}
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {}
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {}
}


// Mock framer-motion for React 19 compatibility
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        const Component = React.forwardRef(({ children, ...props }, ref) => {
          // Filter out framer-motion specific props that React doesn't recognize
          const {
            initial,
            animate,
            exit,
            transition,
            variants,
            whileHover,
            whileInView,
            whileTap,
            whileFocus,
            whileDrag,
            drag,
            dragConstraints,
            dragElastic,
            dragMomentum,
            onDragStart,
            onDragEnd,
            onDrag,
            layout,
            layoutId,
            style,
            ...domProps
          } = props;

          return React.createElement(prop, { ...domProps, ref }, children);
        });
        Component.displayName = `motion.${String(prop)}`;
        return Component;
      }
    }),
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
    }),
    useMotionValue: (initial) => ({ get: () => initial, set: jest.fn() }),
    useTransform: (value, input, output) => value,
    useSpring: (value) => value,
    useScroll: () => ({
      scrollY: { get: () => 0, set: jest.fn() },
      scrollX: { get: () => 0, set: jest.fn() },
    }),
    useInView: () => true,
  };
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock window.matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));
