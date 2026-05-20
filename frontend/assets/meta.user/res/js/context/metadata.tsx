import * as React from 'react';
import MetaClient from '../MetaClient';
import { buildValidator, newValidator } from './utils/validators';
import type { Validator } from './utils/validators';

// FIXME: Properly type this
type PydioNode = {
    getMetadata: () => Map<string, any>;
    getPath: () => string;
    replaceMetadata: (metadata: Map<string, any>, notify?: boolean) => void;
    observe: (eventName: string, callback: (node: PydioNode) => void) => void;
    stopObserving: (
        eventName: string,
        callback: (node: PydioNode) => void,
    ) => void;
};

import { JSONSchemaType, AnySchema } from 'ajv';

interface MetadataState {
    node: PydioNode | null;
    saving: boolean;
    formState: Map<string, any>;
    fields: { [key: string]: any };
    namespaceJsonSchema: AnySchema | null;
    jsonSchema: AnySchema | null;
    shouldSave: boolean;
    errors: { [key: string]: string };
    mode: 'idle' | 'editing' | 'saving' | 'invalid';
}

type MetadataAction =
    | { type: 'set_node'; node: PydioNode | null }
    | { type: 'set_saving'; saving: boolean }
    | {
          type: 'set_form_state';
          formState: Map<string, any>;
          mode: MetadataState['mode'];
      }
    | { type: 'set_namespace_schema'; namespaceJsonSchema: AnySchema | null }
    | { type: 'set_should_save'; shouldSave: boolean }
    | { type: 'set_json_schema'; jsonSchema: AnySchema | null }
    | { type: 'set_errors'; errors: { [key: string]: string } };

interface MetadataActions {
    setNamespaceJsonSchema: (
        namespaceJsonSchema: JSONSchemaType<any> | null,
    ) => void;
    setSaving: (saving: boolean) => void;
    setInitialFormState: (formState: Map<string, any>) => void;
    setFormState: (formState: Map<string, any>) => void;
    /**
     * Set shouldSave triggers a partial save of the metadata
     * when the form is valid.
     */
    setShouldSave: (shouldSave: boolean) => void;
    setJsonSchema: (jsonSchema: AnySchema | null) => void;
}

interface MetadataContextType {
    state: MetadataState;
    dispatch: React.Dispatch<MetadataAction>;
    actions: MetadataActions;
}

const initialState: MetadataState = {
    node: null,
    saving: false,
    formState: new Map(),
    fields: {},
    namespaceJsonSchema: null,
    jsonSchema: null,
    shouldSave: false,
    errors: {},
    mode: 'idle',
};

const reducer = (
    state: MetadataState,
    action: MetadataAction,
): MetadataState => {
    switch (action.type) {
        case 'set_node':
            return { ...state, node: action.node, mode: 'idle' };
        case 'set_saving':
            return {
                ...state,
                saving: action.saving,
                mode: action.saving ? 'saving' : state.mode,
            };
        case 'set_form_state':
            return { ...state, formState: action.formState, mode: action.mode };
        case 'set_namespace_schema':
            return {
                ...state,
                namespaceJsonSchema: action.namespaceJsonSchema,
            };
        case 'set_should_save':
            return { ...state, shouldSave: action.shouldSave };
        case 'set_json_schema':
            return { ...state, jsonSchema: action.jsonSchema, mode: 'idle' };
        case 'set_errors':
            const errorCount = Object.keys(action.errors).length;
            if (errorCount === 0) {
                return { ...state, errors: action.errors, mode: 'editing' };
            }

            return { ...state, errors: action.errors, mode: 'invalid' };
        default:
            return state;
    }
};

const noop = (...args: any[]) => {};

// Validator that accepts everything without validation
const noopValidator: Validator = (formState: Map<string, any>) => ({
    isValid: true,
    errors: {},
});

const isEmpty = (value: any) =>
    value === null || value === undefined || `${value}`.trim().length === 0;

// Helper function to remove entries with empty string keys from a Map
const removeEmptyKeys = (formState: Map<string, any>): Map<string, any> => {
    const cleanedMap = new Map<string, any>();
    formState.forEach((v, k) => k && !isEmpty(v) && cleanedMap.set(k, v));
    return cleanedMap;
};

const defaultContext: MetadataContextType = {
    state: initialState,
    dispatch: noop as React.Dispatch<MetadataAction>,
    actions: {
        setSaving: noop,
        setInitialFormState: noop,
        setFormState: noop,
        setNamespaceJsonSchema: noop,
        setShouldSave: noop,
        setJsonSchema: noop,
    },
};

const SAVE_ERROR_KEY = 'meta.user.errors.save';

export const MetadataContext = React.createContext(defaultContext);

const NODE_REPLACED_EVENT = 'node_replaced';

export type OnChangeContext = {
    mode: MetadataState['mode'];
    errors: { [key: string]: string };
    isValid: boolean;
};

export type OnDataChanged = (
    formData: Map<string, any>,
    onChangeContext: OnChangeContext,
) => void;

type MetadataContextProviderProps = {
    node: PydioNode;
    saveMeta: (formData: Map<string, any>) => Promise<any>;
    value: any;
    onDataChanged: OnDataChanged;
    savePartially?: boolean;
    validateOnSchemaLoad?: boolean;
    /**
     * Apply schema defaults immediately when schema loads (Prompt on Upload feature).
     * This uses mergeOptionalSchemaDefaults() for load-time defaults.
     * Validation-time defaults are always applied by AJV during validate().
     */
    prefillDefaultsOnInitialLoad?: boolean;
    children: React.ReactNode;
};

export const MetadataContextProvider = ({
    node,
    saveMeta,
    value,
    onDataChanged,
    savePartially = false,
    validateOnSchemaLoad = false,
    prefillDefaultsOnInitialLoad = false,
    children,
}: MetadataContextProviderProps) => {
    const validatorRef = React.useRef<Validator>(noopValidator);
    const [state, dispatch] = React.useReducer(reducer, {
        ...initialState,
        node,
        ...(value || {}),
    });

    const actions = React.useMemo(
        () => ({
            setNamespaceJsonSchema: (namespaceJsonSchema) =>
                dispatch({ type: 'set_namespace_schema', namespaceJsonSchema }),

            setSaving: (saving: boolean) =>
                dispatch({ type: 'set_saving', saving }),

            setInitialFormState: (formState: Map<string, unknown>) => {
                const mode = 'idle';
                dispatch({ type: 'set_errors', errors: {} });
                dispatch({ type: 'set_form_state', formState, mode });
                if (onDataChanged) {
                    onDataChanged(formState, {
                        errors: {},
                        isValid: false,
                        mode,
                    });
                }
            },

            setFormState: (formState: Map<string, unknown>) => {
                let { isValid, errors } = validatorRef.current(
                    // NODE: To validate and show the currect message "field is required"
                    removeEmptyKeys(formState),
                );
                dispatch({ type: 'set_errors', errors });

                const mode = isValid ? 'editing' : 'invalid';
                dispatch({
                    type: 'set_form_state',
                    formState: new Map(formState),
                    mode,
                });

                // NOTE: For parents that require holding state because we can't
                // wrap them with a provider.
                // eg. frontend/assets/meta.user/res/js/InfoPanel.js#92-95
                if (onDataChanged) {
                    onDataChanged(formState, {
                        errors,
                        isValid: mode !== 'invalid',
                        mode,
                    });
                }
            },

            setShouldSave: (shouldSave: boolean) =>
                dispatch({ type: 'set_should_save', shouldSave }),
            setJsonSchema: (jsonSchema: AnySchema) =>
                dispatch({ type: 'set_json_schema', jsonSchema }),
        }),
        [state.mode],
    );

    const onNodeReplaced = React.useCallback(
        (newNode) => {
            if (!newNode) return;

            actions.setInitialFormState(new Map(newNode.getMetadata()));
        },
        [node],
    );

    React.useEffect(() => {
        if (!node) return;

        node.observe(NODE_REPLACED_EVENT, onNodeReplaced);

        return () => node.stopObserving(NODE_REPLACED_EVENT, onNodeReplaced);
    }, [node]);

    React.useEffect(() => {
        if (!node) return;

        MetaClient.getInstance()
            .getNamespaceSchema()
            .then((ns) => {
                if (!ns) return;
                actions.setJsonSchema(ns.JsonSchema);
            });
    }, [node]);

    // Form state initialization once schema is received
    React.useEffect(() => {
        if (!state.jsonSchema) return;

        validatorRef.current = buildValidator(state.jsonSchema, {
            applyDefaults: false,
        });

        let initialFormState = new Map(node.getMetadata());

        // NOTE: This applies defaults values to the form state
        if (prefillDefaultsOnInitialLoad && state.jsonSchema) {
            const initialFormData = Object.fromEntries(initialFormState);
            const validator = newValidator(state.jsonSchema, {
                applyDefaults: true,
            });
            validator(initialFormData);
            initialFormState = new Map(Object.entries(initialFormData));
        }

        if (validateOnSchemaLoad) {
            actions.setFormState(initialFormState);
            return;
        }

        actions.setInitialFormState(initialFormState);
    }, [state.jsonSchema, node, prefillDefaultsOnInitialLoad]);

    React.useEffect(() => {
        actions.setInitialFormState(new Map(node.getMetadata()));
    }, [node.getPath()]);

    // NOTE: here is the final validation and save of the metadata
    React.useEffect(() => {
        // NOTE: savePartially only for info panel and popover form
        // see: frontend/assets/meta.user/res/js/UserMetaDialog.js
        if (!savePartially || !state.shouldSave) return;

        let { isValid, errors } = validatorRef.current(state.formState);
        dispatch({ type: 'set_errors', errors });

        if (!isValid) return;

        if (saveMeta) {
            actions.setSaving(true);
            saveMeta(state.formState)
                .then(() => {
                    actions.setSaving(false);
                    actions.setShouldSave(false);
                    node.replaceMetadata(state.formState, true);
                })
                .catch((e) => {
                    console.error('Error saving metadata', e);
                    dispatch({
                        type: 'set_errors',
                        errors: { form: SAVE_ERROR_KEY },
                    });

                    actions.setSaving(false);
                    actions.setShouldSave(false);
                });
        }
    }, [state.shouldSave]);

    const contextValue = React.useMemo(
        () => ({
            state,
            dispatch,
            actions,
        }),
        [state, dispatch, actions],
    );

    return (
        <MetadataContext.Provider value={contextValue}>
            {children}
        </MetadataContext.Provider>
    );
};

export const useMetadataContext = () => React.useContext(MetadataContext);
