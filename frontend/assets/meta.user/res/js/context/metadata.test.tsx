import * as React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Mock } from 'vitest'
import { renderHook, act, waitFor, render, screen } from '@testing-library/react'

// Suppress console.log from reducer
vi.spyOn(console, 'log').mockImplementation(() => {})

import testSchema from '../__fixtures__/test-schema.json'

// Mock MetaClient before importing the module
vi.mock('../MetaClient', () => ({
    default: {
        getInstance: vi.fn()
    }
}))

// Mock ajv and ajv-formats
const { mockCompile, mockAjv, mockAddFormats } = vi.hoisted(() => {
    const mockCompile: Mock<() => any> = vi.fn()
    const mockAjv: Mock<() => any> = vi.fn(function() {
        return {
            compile: mockCompile
        }
    })
    const mockAddFormats: Mock<() => any> = vi.fn()
    return { mockCompile, mockAjv, mockAddFormats }
})
vi.mock('ajv', () => ({
    default: mockAjv,
    JSONSchemaType: {},
    ValidateFunction: {},
    __esModule: true
}))
vi.mock('ajv-formats', () => ({
    default: mockAddFormats
}))

import MetaClient from '../MetaClient'
import { MetadataContextProvider, useMetadataContext, MetadataContext } from './metadata'

interface MockNode {
  getMetadata: Mock<() => Map<string, any>>;
  getPath: Mock<() => string>;
  replaceMetadata: Mock<(metadata: Map<string, any>, notify?: boolean) => void>;
  observe: Mock<(eventName: string, callback: (node: MockNode) => void) => void>;
  stopObserving: Mock<(eventName: string, callback: (node: MockNode) => void) => void>;
  [key: string]: any;
}

// Helper to create a mock node
const createMockNode = (overrides: Partial<MockNode> = {}): MockNode => ({
    getMetadata: vi.fn(() => new Map()),
    getPath: vi.fn(() => '/test/path'),
    replaceMetadata: vi.fn(),
    observe: vi.fn(),
    stopObserving: vi.fn(),
    ...overrides
})

describe('MetadataContext', () => {
    let mockNode: MockNode
    let mockSaveMeta: Mock<(formData: Map<string, any>) => Promise<any>>
    let mockOnDataChanged: Mock<(formData: Map<string, any>, isValid: boolean) => void>
    let mockValidator: Mock<any> & { errors: any }

    beforeEach(() => {
        mockNode = createMockNode()
        mockSaveMeta = vi.fn(() => Promise.resolve())
        mockOnDataChanged = vi.fn()
        mockValidator = vi.fn() as Mock<any> & { errors: any }
        mockCompile.mockReturnValue(mockValidator)
        // Setup default MetaClient mock
        MetaClient.getInstance.mockReturnValue({
            getNamespaceSchema: vi.fn(() => Promise.resolve({ JsonSchema: null }))
        })
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })



    describe('MetadataContextProvider', () => {
        it('renders children and provides context', () => {
            const TestChild = () => {
                const context = useMetadataContext()
                return <div data-testid="child">{context.state.node ? 'has node' : 'no node'}</div>
            }

            render(
                <MetadataContextProvider
                    node={mockNode}
                    saveMeta={mockSaveMeta}
                    value={{}}
                    onDataChanged={mockOnDataChanged}
                >
                    <TestChild />
                </MetadataContextProvider>
            )

            expect(screen.getByTestId('child')).toHaveTextContent('has node')
        })

        it('initializes state with node and value props', () => {
            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{ fields: { test: 'value' } }}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            expect(result.current.state.node).toBe(mockNode)
            expect(result.current.state.fields).toEqual({ test: 'value' })
        })

        it('calls getNamespaceSchema on node change', async () => {
            const mockGetNamespaceSchema = vi.fn(() => Promise.resolve({ JsonSchema: testSchema }))
            MetaClient.getInstance.mockReturnValue({
                getNamespaceSchema: mockGetNamespaceSchema
            })

            renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            await waitFor(() => {
                expect(mockGetNamespaceSchema).toHaveBeenCalled()
            })
            // Should set jsonSchema in state
            // We can't directly access state, but we can check that compile was called
            await waitFor(() => {
                expect(mockCompile).toHaveBeenCalledWith(testSchema)
            })
        })

        it('updates formState when node path changes', async () => {
            const metadata = new Map([['key', 'value']])
            mockNode.getMetadata.mockReturnValue(metadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Set the formState directly (simulating what the effect does)
            act(() => {
                result.current.actions.setFormState(metadata)
            })

            // Verify onDataChanged was called with the cleaned formState (same data as input since no empty keys)
            expect(mockOnDataChanged).toHaveBeenCalled()
            const callArgs = mockOnDataChanged.mock.calls[mockOnDataChanged.mock.calls.length - 1]
            expect(callArgs[0].get('key')).toBe('value')
        })

        it('calls onDataChanged when formState changes', async () => {
            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            const newFormState = new Map([['newKey', 'newValue']])
            act(() => {
                result.current.actions.setFormState(newFormState)
            })

            expect(mockOnDataChanged).toHaveBeenCalledWith(newFormState, expect.any(Boolean))
        })

        it('validates and saves when shouldSave becomes true', async () => {
            // Setup validator to pass
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set jsonSchema to trigger validator creation
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Set formState
            act(() => {
                result.current.actions.setFormState(new Map([['usermeta-text', 'valid']]))
            })

            // After validation passes, errors should be empty object
            await waitFor(() => {
                expect(result.current.state.errors).toEqual({})
                expect(Object.keys(result.current.state.errors).length).toBe(0)
            })

            // Trigger save
            act(() => {
                result.current.actions.setShouldSave(true)
            })

            await waitFor(() => {
                expect(mockSaveMeta).toHaveBeenCalled()
                expect(result.current.state.saving).toBe(false)
                expect(result.current.state.shouldSave).toBe(false)
            })
        })

        it('does not save when validation fails and savePartially is false', async () => {
            // Setup validator to fail
            mockValidator.mockReturnValue(false)
            mockValidator.errors = [
                { instancePath: '/usermeta-text', schemaPath: '#/properties/usermeta-text/minLength', message: 'must be at least 3 characters', params: {} }
            ]

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                        savePartially={false}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            act(() => {
                result.current.actions.setFormState(new Map([['usermeta-text', 'ab']]))
            })

            act(() => {
                result.current.actions.setShouldSave(true)
            })

            await waitFor(() => {
                expect(mockSaveMeta).not.toHaveBeenCalled()
                const errors = result.current.state.errors
                // errors could be Map or plain object
                const error = errors.get ? errors.get('usermeta-text') : errors['usermeta-text']
                expect(error).toEqual(expect.any(String))
            })
        })

        it('saves even when validation fails if savePartially is true', async () => {
            mockValidator.mockReturnValue(false)
            mockValidator.errors = []

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                        savePartially={true}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            act(() => {
                result.current.actions.setFormState(new Map([['usermeta-text', 'ab']]))
            })

            act(() => {
                result.current.actions.setShouldSave(true)
            })

            await waitFor(() => {
                expect(mockSaveMeta).toHaveBeenCalled()
            })
        })

        it('blocks save when savePartially is false and validation fails', async () => {
            // Setup validator to fail with specific error
            mockValidator.mockReturnValue(false)
            mockValidator.errors = [
                { instancePath: '/usermeta-text', schemaPath: '#/properties/usermeta-text/minLength', message: 'must be at least 3 characters', params: {} }
            ]

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                        savePartially={false}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Set invalid data
            act(() => {
                result.current.actions.setFormState(new Map([['usermeta-text', 'x']]))
            })

            // Try to save
            mockSaveMeta.mockClear()
            act(() => {
                result.current.actions.setShouldSave(true)
            })

            // Wait and verify save was NOT called
            await waitFor(() => {
                expect(mockSaveMeta).not.toHaveBeenCalled()
                expect(result.current.state.saving).toBe(false)
                expect(result.current.state.shouldSave).toBe(true) // Should remain true since save was blocked
            })
        })

        it('savePartially defaults to false when not provided', async () => {
            // Setup validator to fail
            mockValidator.mockReturnValue(false)
            mockValidator.errors = [
                { instancePath: '/usermeta-text', schemaPath: '#/properties/usermeta-text/minLength', message: 'must be at least 3 characters', params: {} }
            ]

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                        // No savePartially prop - should default to false
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Set invalid data
            act(() => {
                result.current.actions.setFormState(new Map([['usermeta-text', 'no']]))
            })

            mockSaveMeta.mockClear()
            act(() => {
                result.current.actions.setShouldSave(true)
            })

            // Should NOT save (default is false)
            await waitFor(() => {
                expect(mockSaveMeta).not.toHaveBeenCalled()
            })
        })

        it('allows save when savePartially is true even with validation errors', async () => {
            // Setup validator to fail with errors
            mockValidator.mockReturnValue(false)
            mockValidator.errors = [
                { instancePath: '/field1', schemaPath: '#/properties/field1/type', message: 'must be string', params: {} },
                { instancePath: '/field2', schemaPath: '#/properties/field2/minLength', message: 'must be at least 5 characters', params: {} }
            ]

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                        savePartially={true}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Set data with validation errors
            const invalidData = new Map([
                ['field1', 123], // wrong type
                ['field2', 'abc'] // too short
            ])
            act(() => {
                result.current.actions.setFormState(invalidData)
            })

            mockSaveMeta.mockClear()
            act(() => {
                result.current.actions.setShouldSave(true)
            })

            // Should save despite errors
            await waitFor(() => {
                expect(mockSaveMeta).toHaveBeenCalledWith(invalidData)
                expect(result.current.state.saving).toBe(false)
                expect(result.current.state.shouldSave).toBe(false)
            })
        })

        it('removes empty string keys from formState', () => {
            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            mockOnDataChanged.mockClear()

            // Create formState with an empty string key
            const formStateWithEmptyKey = new Map([
                ['key1', 'value1'],
                ['', 'emptyKeyValue'],
                ['key2', 'value2']
            ])

            act(() => {
                result.current.actions.setFormState(formStateWithEmptyKey)
            })

            // Verify onDataChanged was called
            expect(mockOnDataChanged).toHaveBeenCalled()
            const cleanedState = mockOnDataChanged.mock.calls[0][0]

            // The cleaned formState should not contain the empty key
            expect(cleanedState.has('')).toBe(false)
            expect(cleanedState.get('key1')).toBe('value1')
            expect(cleanedState.get('key2')).toBe('value2')
            expect(cleanedState.size).toBe(2)
        })

        it('preserves entries with empty string values', () => {
            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            mockOnDataChanged.mockClear()

            // Create formState with empty string VALUE (not key)
            const formStateWithEmptyValue = new Map([
                ['key1', 'value1'],
                ['key2', ''],  // empty value, but valid key
                ['key3', 'value3']
            ])

            act(() => {
                result.current.actions.setFormState(formStateWithEmptyValue)
            })

            // Verify onDataChanged was called
            expect(mockOnDataChanged).toHaveBeenCalled()
            const cleanedState = mockOnDataChanged.mock.calls[0][0]

            // All keys should be preserved, including the one with empty value
            expect(cleanedState.get('key1')).toBe('value1')
            expect(cleanedState.get('key2')).toBe('')
            expect(cleanedState.get('key3')).toBe('value3')
            expect(cleanedState.size).toBe(3)
        })

        it('keeps all valid non-empty keys intact', () => {
            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            mockOnDataChanged.mockClear()

            const formState = new Map([
                ['usermeta-text', 'hello'],
                ['key-with-dash', 'value'],
                ['key_with_underscore', 'value'],
                ['123numerickey', 'value']
            ])

            act(() => {
                result.current.actions.setFormState(formState)
            })

            // Verify onDataChanged was called
            expect(mockOnDataChanged).toHaveBeenCalled()
            const cleanedState = mockOnDataChanged.mock.calls[0][0]

            // All valid keys should be preserved
            expect(cleanedState.get('usermeta-text')).toBe('hello')
            expect(cleanedState.get('key-with-dash')).toBe('value')
            expect(cleanedState.get('key_with_underscore')).toBe('value')
            expect(cleanedState.get('123numerickey')).toBe('value')
            expect(cleanedState.size).toBe(4)
        })

        it('passes cleaned formState to onDataChanged callback', () => {
            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            const formStateWithEmptyKey = new Map([
                ['key1', 'value1'],
                ['', 'emptyKeyValue'],
                ['key2', 'value2']
            ])

            act(() => {
                result.current.actions.setFormState(formStateWithEmptyKey)
            })

            // Verify onDataChanged was called with cleaned formState
            expect(mockOnDataChanged).toHaveBeenCalled()
            const callArgs = mockOnDataChanged.mock.calls[mockOnDataChanged.mock.calls.length - 1]
            const cleanedFormState = callArgs[0]

            // The callback should receive formState without empty keys
            expect(cleanedFormState.has('')).toBe(false)
            expect(cleanedFormState.get('key1')).toBe('value1')
            expect(cleanedFormState.get('key2')).toBe('value2')
            expect(cleanedFormState.size).toBe(2)
        })
    })

    describe('useMetadataContext', () => {
        it('returns default context when used outside provider', () => {
            const { result } = renderHook(() => useMetadataContext())
            expect(result.current.state.node).toBeNull()
            expect(result.current.state.saving).toBe(false)
            expect(result.current.state.formState).toBeInstanceOf(Map)
            expect(result.current.state.fields).toEqual({})
            expect(result.current.state.namespaceJsonSchema).toBeNull()
            expect(result.current.state.jsonSchema).toBeNull()
            expect(result.current.state.shouldSave).toBe(false)
            expect(result.current.state.editingTag).toBe('none')
            expect(result.current.state.errors).toEqual({})
            // dispatch and actions should be noop functions
            expect(typeof result.current.dispatch).toBe('function')
            expect(typeof result.current.actions.setSaving).toBe('function')
        })

        it('returns provider context when inside provider', () => {
            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            expect(result.current.state.node).toBe(mockNode)
            expect(typeof result.current.dispatch).toBe('function')
            expect(typeof result.current.actions.setSaving).toBe('function')
        })

        it('actions update state via dispatch', () => {
            // Setup validator first
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            act(() => {
                result.current.actions.setSaving(true)
            })
            expect(result.current.state.saving).toBe(true)

            act(() => {
                result.current.actions.setFields({ foo: 'bar' })
            })
            expect(result.current.state.fields).toEqual({ foo: 'bar' })

            // Set schema first to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })
            expect(result.current.state.jsonSchema).toBe(testSchema)

            const newFormState = new Map([['key', 'val']])
            mockOnDataChanged.mockClear()
            act(() => {
                result.current.actions.setFormState(newFormState)
            })
            // After cleaning empty keys, the formState should contain the same data
            // Verify via the onDataChanged callback since that's what gets called
            expect(mockOnDataChanged).toHaveBeenCalled()
            const callArgs = mockOnDataChanged.mock.calls[0]
            expect(callArgs[0].get('key')).toBe('val')
            expect(callArgs[0].size).toBe(1)

            act(() => {
                result.current.actions.setNamespaceJsonSchema(testSchema)
            })
            expect(result.current.state.namespaceJsonSchema).toBe(testSchema)

            act(() => {
                result.current.actions.setShouldSave(true)
            })
            expect(result.current.state.shouldSave).toBe(true)
        })

        it('observes node_replaced event and updates formState when node is replaced', async () => {
            // Setup initial node with metadata
            const initialMetadata = new Map([['key1', 'value1']])
            mockNode.getMetadata.mockReturnValue(initialMetadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Verify that node.observe was called with 'node_replaced' event
            expect(mockNode.observe).toHaveBeenCalledWith('node_replaced', expect.any(Function))
        })

        it('fires node_replaced event handler with new node metadata', async () => {
            const initialMetadata = new Map([['key1', 'value1']])
            const newMetadata = new Map([['key2', 'value2']])
            mockNode.getMetadata.mockReturnValue(initialMetadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Get the callback that was passed to node.observe
            const observeCall = mockNode.observe.mock.calls.find(
                (call) => call[0] === 'node_replaced'
            )
            expect(observeCall).toBeDefined()

            const nodeReplacedCallback = observeCall![1]

            // Create a new mock node with different metadata
            const newNode = createMockNode({
                getMetadata: vi.fn(() => newMetadata)
            })

            // Clear previous calls to onDataChanged
            mockOnDataChanged.mockClear()

            // Simulate the node_replaced event by calling the callback
            act(() => {
                nodeReplacedCallback(newNode)
            })

            // Verify that onDataChanged was called with the new metadata
            await waitFor(() => {
                expect(mockOnDataChanged).toHaveBeenCalledWith(newMetadata, expect.any(Boolean))
            })
        })

        it('cleans up node_replaced observer on unmount', () => {
            const initialMetadata = new Map([['key1', 'value1']])
            mockNode.getMetadata.mockReturnValue(initialMetadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { unmount } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Verify that node.observe was called
            expect(mockNode.observe).toHaveBeenCalledWith('node_replaced', expect.any(Function))

            // Get the callback that was registered
            const observeCall = mockNode.observe.mock.calls.find(
                (call) => call[0] === 'node_replaced'
            )
            const nodeReplacedCallback = observeCall![1]

            // Unmount the component
            unmount()

            // Verify that stopObserving was called with the same callback
            expect(mockNode.stopObserving).toHaveBeenCalledWith('node_replaced', nodeReplacedCallback)
        })

        it('handles new node being null in node_replaced callback', async () => {
            const initialMetadata = new Map([['key1', 'value1']])
            mockNode.getMetadata.mockReturnValue(initialMetadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Get the callback
            const observeCall = mockNode.observe.mock.calls.find(
                (call) => call[0] === 'node_replaced'
            )
            const nodeReplacedCallback = observeCall![1]

            mockOnDataChanged.mockClear()

            // Call callback with null node - should return early and not crash
            act(() => {
                nodeReplacedCallback(null)
            })

            // onDataChanged should not be called
            expect(mockOnDataChanged).not.toHaveBeenCalled()
        })

        it('handles multiple rapid node replacements', async () => {
            const initialMetadata = new Map([['key1', 'value1']])
            const metadata2 = new Map([['key2', 'value2']])
            const metadata3 = new Map([['key3', 'value3']])

            mockNode.getMetadata.mockReturnValue(initialMetadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Get the callback
            const observeCall = mockNode.observe.mock.calls.find(
                (call) => call[0] === 'node_replaced'
            )
            const nodeReplacedCallback = observeCall![1]

            mockOnDataChanged.mockClear()

            // Create multiple nodes
            const node2 = createMockNode({ getMetadata: vi.fn(() => metadata2) })
            const node3 = createMockNode({ getMetadata: vi.fn(() => metadata3) })

            // Fire multiple replacements rapidly
            act(() => {
                nodeReplacedCallback(node2)
                nodeReplacedCallback(node3)
            })

            // Should have been called twice, with the last metadata winning
            await waitFor(() => {
                expect(mockOnDataChanged).toHaveBeenCalledTimes(2)
                // Last call should have node3's metadata - compare by Map content
                const lastCall = mockOnDataChanged.mock.calls[mockOnDataChanged.mock.calls.length - 1]
                const lastMetadata = lastCall[0]
                expect(lastMetadata.get('key3')).toBe('value3')
                expect(lastMetadata.size).toBe(1)
            })
        })

        it('skips unnecessary updates when metadata is identical', async () => {
            const sharedMetadata = new Map([['key1', 'value1']])
            mockNode.getMetadata.mockReturnValue(sharedMetadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Get the callback
            const observeCall = mockNode.observe.mock.calls.find(
                (call) => call[0] === 'node_replaced'
            )
            const nodeReplacedCallback = observeCall![1]

            mockOnDataChanged.mockClear()

            // Create node with same metadata
            const newNode = createMockNode({
                getMetadata: vi.fn(() => sharedMetadata)
            })

            // Fire replacement
            act(() => {
                nodeReplacedCallback(newNode)
            })

            // Should still call onDataChanged (we don't do equality checking in current impl)
            // This tests current behavior - optimization could be added later
            await waitFor(() => {
                expect(mockOnDataChanged).toHaveBeenCalledWith(sharedMetadata, expect.any(Boolean))
            })
        })

        it('handles same node being replaced with itself', async () => {
            const metadata = new Map([['key1', 'value1']])
            mockNode.getMetadata.mockReturnValue(metadata)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Get the callback
            const observeCall = mockNode.observe.mock.calls.find(
                (call) => call[0] === 'node_replaced'
            )
            const nodeReplacedCallback = observeCall![1]

            mockOnDataChanged.mockClear()

            // Replace with the same node
            act(() => {
                nodeReplacedCallback(mockNode)
            })

            // Should still update (no identity check in current impl)
            await waitFor(() => {
                expect(mockOnDataChanged).toHaveBeenCalledWith(metadata, expect.any(Boolean))
            })
        })

        it('properly registers callback with current node reference', async () => {
            // This test verifies that the onNodeReplaced callback is registered with the 
            // current node instance and not stale references
            const metadata1 = new Map([['key1', 'value1']])
            mockNode.getMetadata.mockReturnValue(metadata1)

            // Setup validator
            mockValidator.mockReturnValue(true)
            mockValidator.errors = null

            const { result } = renderHook(() => useMetadataContext(), {
                wrapper: ({ children }) => (
                    <MetadataContextProvider
                        node={mockNode}
                        saveMeta={mockSaveMeta}
                        value={{}}
                        onDataChanged={mockOnDataChanged}
                    >
                        {children}
                    </MetadataContextProvider>
                )
            })

            // Set schema to initialize validator
            act(() => {
                result.current.actions.setJsonSchema(testSchema)
            })

            // Verify the observer was registered exactly once
            expect(mockNode.observe).toHaveBeenCalledTimes(1)
            expect(mockNode.observe).toHaveBeenCalledWith('node_replaced', expect.any(Function))

            // Get the registered callback
            const callback = mockNode.observe.mock.calls[0][1]

            mockOnDataChanged.mockClear()

            // Create a new node and invoke the callback with it
            const newNode = createMockNode({
                getMetadata: vi.fn(() => new Map([['newKey', 'newValue']]))
            })

            act(() => {
                callback(newNode)
            })

            // Verify the callback used the new node's metadata
            await waitFor(() => {
                expect(mockOnDataChanged).toHaveBeenCalled()
                const callArgs = mockOnDataChanged.mock.calls[0][0]
                expect(callArgs.get('newKey')).toBe('newValue')
            })
        })
    })
})
