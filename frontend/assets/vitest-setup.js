import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

global.ResizeObserver = class ResizeObserver {
    constructor() {
        this.cb = vi.fn()
    }
    observe() {}
    disconnect() {}
    unobserve() {}
}

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})