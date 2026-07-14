// Minimal vitest stub for Storybook preview.
// @storybook/test imports { vi, expect, ... } from 'vitest' into the preview
// runtime. Stories never run tests, so we provide no-op shims. The real expect
// is re-exported by @storybook/test itself; we only need to satisfy the bare
// named imports here.
export const vi = {
    fn: (impl) => (typeof impl === 'function' ? impl : () => {}),
    spyOn: () => () => {},
    mock: () => {},
    stubGlobal: () => {},
    hoisted: (fn) => (typeof fn === 'function' ? fn() : fn),
};
export const expect = () => {};
expect.extend = () => {};
expect.anything = () => ({});
expect.any = () => ({});
export const assert = () => {};
export const beforeEach = () => {};
export const afterEach = () => {};
export const beforeAll = () => {};
export const afterAll = () => {};
export const it = () => {};
export const test = () => {};
export const describe = () => {};
