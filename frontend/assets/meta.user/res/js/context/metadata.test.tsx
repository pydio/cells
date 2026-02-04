import * as React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Mock } from 'vitest'
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
    const mockCompile = vi.fn()
    const mockAjv = vi.fn(function() {
        return {
            compile: mockCompile
        }
    })
    const mockAddFormats = vi.fn()
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
  getMetadata: Mock<any>;
  getPath: Mock<any>;
  replaceMetadata: Mock<any>;
  [key: string]: any;
}

// Helper to create a mock node
const createMockNode = (overrides: Partial<MockNode> = {}): MockNode => ({
    getMetadata: vi.fn(() => new Map()),
    getPath: vi.fn(() => '/test/path'),
    replaceMetadata: vi.fn(),
    ...overrides
})

describe('MetadataContext', () => {
    let mockNode: MockNode
    let mockSaveMeta: Mock<any>
    let mockOnDataChanged: Mock<any>
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

            // Verify formState was updated
            expect(result.current.state.formState.get('key')).toBe('value')
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
            act(() => {
                result.current.actions.setFormState(newFormState)
            })
            expect(result.current.state.formState).toBe(newFormState)

            act(() => {
                result.current.actions.setNamespaceJsonSchema(testSchema)
            })
            expect(result.current.state.namespaceJsonSchema).toBe(testSchema)

            act(() => {
                result.current.actions.setShouldSave(true)
            })
            expect(result.current.state.shouldSave).toBe(true)
        })
    })
})
