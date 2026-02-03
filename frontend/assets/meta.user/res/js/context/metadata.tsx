import * as React from 'react'
import MetaClient from "../MetaClient";

// FIXME: Properly type this
type PydioNode = unknown;

import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import addFormats from 'ajv-formats'

interface MetadataState {
    node: PydioNode | null;
    saving: boolean;
    formState: Map<string, any>;
    fields: {[key: string]: any};
    namespaceJsonSchema: JSONSchemaType<any> | null;
    jsonSchema: JSONSchemaType<any> | null;
    shouldSave: boolean;
    editingTag: string;
    errors: {[key: string]: string};
}

type MetadataAction =
    | { type: 'set_node'; node: PydioNode | null }
    | { type: 'set_saving'; saving: boolean }
    | { type: 'set_form_state'; formState: Map<string, any> }
    | { type: 'set_fields'; fields: {[key: string]: any} }
    | { type: 'set_namespace_schema'; namespaceJsonSchema: JSONSchemaType<any> | null }
    | { type: 'set_should_save'; shouldSave: boolean }
    | { type: 'set_json_schema'; jsonSchema: JSONSchemaType<any> | null }
    | { type: 'set_errors'; errors: {[key: string]: string} };

interface MetadataActions {
    setNamespaceJsonSchema: (namespaceJsonSchema: JSONSchemaType<any> | null) => void;
    setSaving: (saving: boolean) => void;
    setFormState: (formState: Map<string, any>) => void;
    setShouldSave: (shouldSave: boolean) => void;
    setFields: (fields: {[key: string]: any}) => void;
    setJsonSchema: (jsonSchema: JSONSchemaType<any> | null) => void;
}

interface MetadataContextType {
    state: MetadataState;
    dispatch: React.Dispatch<MetadataAction>;
    actions: MetadataActions;
}

const ajv = new Ajv({allErrors: true});
addFormats(ajv)

const initialState: MetadataState = {
    node: null,
    saving: false,
    formState: new Map(),
    fields: {},
    namespaceJsonSchema: null,
    jsonSchema: null,
    shouldSave: false,
    editingTag: 'none',
    errors: {}
}

const reducer = (state: MetadataState, action: MetadataAction): MetadataState => {
    switch (action.type) {
        case 'set_node':
            return { ...state, node: action.node }
        case 'set_saving':
            return { ...state, saving: action.saving }
        case 'set_form_state':
            return { ...state, formState: action.formState }
        case 'set_fields':
            return { ...state, fields: action.fields }
        case 'set_namespace_schema':
            return { ...state, namespaceJsonSchema: action.namespaceJsonSchema }
        case 'set_should_save':
            return { ...state, shouldSave: action.shouldSave }
        case 'set_json_schema':
            return { ...state, jsonSchema: action.jsonSchema }
        case 'set_errors':
            return { ...state, errors: action.errors }
        default:
            return state
    }
}

const noop = (...args: any[]) => {}

const defaultContext: MetadataContextType = {
    state: initialState,
    dispatch: noop as React.Dispatch<MetadataAction>,
    actions: {
        setSaving: noop,
        setFormState: noop,
        setFields: noop,
        setNamespaceJsonSchema: noop,
        setShouldSave: noop,
        setJsonSchema: noop
    }
}

export const MetadataContext = React.createContext(defaultContext)

const mapErrors = (errors: any[]) => {
    if (!errors) return new Map()

    return errors.reduce((acc: {[key: string]: string}, e: any) => {
        if (!e.schemaPath.includes('#required') && e.params.missingProperty) {
            const key = e.params.missingProperty.replace('/', '')
            return { ...acc, [key]: e.message }
        }
        const key = e.instancePath.replace('/', '')
        return { ...acc, [key]: e.message }
    }, {})
}

const formatSpecialCasesForValidation = (formState: Map<string, any>, jsonSchema: JSONSchemaType<any> | null) => {
    if (!jsonSchema) return formState

    const { properties } = jsonSchema
    const entries = {}
    formState.forEach((v, k) => {
        if (properties[k]?.format === 'time') {
            const date = new Date(parseFloat(v) * 1000).toISOString();
            const [hours, minutes, seconds] = date.split('T')[1].split(':');
            entries[k] = `${hours}:${minutes}:${seconds}`;
            return
        }

        if (properties[k]?.format === 'date-time' || properties[k]?.format === 'date') {
            entries[k] = new Date(parseFloat(v) * 1000).toISOString()
            return
        }

        entries[k] = v
    })

    return entries
}

type MetadataContextProviderProps = {
    node: PydioNode;
    saveMeta: (formData: Map<string, any>) => Promise<any>;
    value: any;
    onDataChanged: (formData: Map<string, any>, isValid: boolean) => void;
    savePartially: boolean;
    children: React.ReactNode;
}

export const MetadataContextProvider = ({
    node,
    saveMeta,
    value,
    onDataChanged,
    savePartially = false,
    children,
}: MetadataContextProviderProps) => {
    const validatorRef = React.useRef<ValidateFunction<any> | null>(null);
    const [state, dispatch] = React.useReducer(reducer, {
        ...initialState,
        node,
        ...(value || {})
    })

    const actions = React.useMemo(() => ({
        setNamespaceJsonSchema: (namespaceJsonSchema) =>
            dispatch({ type: 'set_namespace_schema', namespaceJsonSchema }),

        setSaving: (saving) => dispatch({ type: 'set_saving', saving }),

        setFormState: (formState) => {
            let isValid = false;
            if (validatorRef.current) {
                isValid = validatorRef.current(
                    formatSpecialCasesForValidation(
                        formState,
                        validatorRef.current.schema
                    )
                )
                const errors = mapErrors(validatorRef.current.errors)
                dispatch({ type: 'set_errors', errors })
            }

            dispatch({ type: 'set_form_state', formState })

            // NOTE: For parents that require holding state because we can't
            // wrap them with a provider.
            // eg. frontend/assets/meta.user/res/js/InfoPanel.js#92-95
            if (onDataChanged) onDataChanged(formState, isValid)
        },

        setShouldSave: (shouldSave) => dispatch({ type: 'set_should_save', shouldSave }),
        setFields: (fields) => dispatch({ type: 'set_fields', fields }),
        setJsonSchema: (jsonSchema) => dispatch({ type: 'set_json_schema', jsonSchema })
    }), []);

    React.useEffect(() => {
        if (!state.jsonSchema) return

        validatorRef.current = ajv.compile(state.jsonSchema)
        actions.setFormState(state.formState)
    }, [state.jsonSchema]);

    React.useEffect(() => {
        if (!node) return

        MetaClient
            .getInstance()
            .getNamespaceSchema()
            .then(ns => {
                if (!ns) return
                actions.setJsonSchema(ns.JsonSchema)
            })

        actions.setFormState(new Map(node.getMetadata()))
    }, [node]);


    React.useEffect(() => {
        if(state.saving) return;

        const metadata = node.getMetadata()
        actions.setFormState(metadata)
    }, [node.getPath(), state.saving]);


    // NOTE: here is the final validation and save of the metadata
    React.useEffect(() => {
        if (!state.shouldSave) return;

        if (validatorRef.current) {
            let isValid = validatorRef.current(
                formatSpecialCasesForValidation(
                    state.formState,
                    validatorRef.current.schema
                )
            )
            const errors = mapErrors(validatorRef.current.errors)
            dispatch({ type: 'set_errors', errors })

            // NOTE: savePartialy is only for the mutiple node selection for now
            // see: frontend/assets/meta.user/res/js/UserMetaDialog.js
            if (!savePartially && !isValid) return;
        }

        if (state.shouldSave && saveMeta) {
            actions.setSaving(true)
            saveMeta(state.formState)
                .then(() => {
                    actions.setSaving(false)
                    actions.setShouldSave(false)
                    node.replaceMetadata(state.formState, true);
                })
        }
    }, [state.shouldSave])

    const contextValue = React.useMemo(() => ({
        state,
        dispatch,
        actions
    }), [state, dispatch, actions])

    return (
        <MetadataContext.Provider value={contextValue}>
            {children}
        </MetadataContext.Provider>
    )
}

export const useMetadataContext = () => React.useContext(MetadataContext)
