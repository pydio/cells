import * as React from 'react'
import MetaClient from "../MetaClient";

import Ajv from "ajv";
import addFormats from 'ajv-formats'

const ajv = new Ajv({allErrors: true});
addFormats(ajv)

const initialState = {
    node: null,
    saving: false,
    formState: new Map(),
    fields: {},
    namespaceJsonSchema: null,
    shouldSave: false,
    editingTag: 'none',
    setJsonSchema: null,
    errors: {}
}

const reducer = (state, action) => {
    console.log('(metadata:17) - @@@@@@  state.action: ',  action);
    console.log('(metadata:19) - @@@@@@  state.formState: ', state.formState);
    console.log('(metadata:25) - @@@@@@  state.errors: ', state.errors);
    switch (action.type) {
        case 'set_node':
            return { ...state, node: action.node }
        case 'set_saving':
            return { ...state, saving: action.saving }
        case 'set_form_state':
            console.log('(metadata:25) - @@@@@@  action.formState: ',  action.formState);
            return { ...state, formState: action.formState }
        case 'set_fields':
            return { ...state, fields: action.fields }
        case 'set_namespace_schema':
            return { ...state, namespaceJsonSchema: action.namespaceJsonSchema }
        case 'set_should_save':
            return { ...state, shouldSave: action.shouldSave }
        case 'set_editing_tag':
            return { ...state, editingTag: action.editingTag }
        case 'set_json_schema':
            return { ...state, jsonSchema: action.jsonSchema }
        case 'set_errors':
            return { ...state, errors: action.errors }
        default:
            return state
    }
}

const noop = (...args) => {}

const defaultContext = {
    state: initialState,
    dispatch: noop,
    actions: {
        setSaving: noop,
        setFormState: noop,
        setFields: noop,
        setNamespaceJsonSchema: noop,
        setValidators: noop,
        setShouldSave: noop,
        setEditingTag: noop,
        setJsonSchema: noop
    }
}

export const MetadataContext = React.createContext(defaultContext)

const mapErrors = (errors) => {
    if (!errors) return new Map()

    return errors.reduce((acc, e) => {
        if (!e.schemaPath.includes('#required') && e.params.missingProperty) {
            const key = e.params.missingProperty.replace('/', '')
            return { ...acc, [key]: e.message }
        }
        const key = e.instancePath.replace('/', '')
        return { ...acc, [key]: e.message }
    }, {})
}

const formatSpecialCasesForValidation = (formState, jsonSchema) => {
    if (!jsonSchema) return formState

    const { properties } = jsonSchema
    const entries = {}
    formState.forEach((v, k) => {
        if (properties[k]?.format === 'date-time') {
            entries[k] = new Date(parseFloat(v) * 1000).toISOString()
            return
        }

        entries[k] = v
    })

    console.log('(metadata:97) - @@@@@@ entries: ', entries);
    return entries
}

export const MetadataContextProvider = ({
    node,
    saveMeta,
    value,
    onDataChanged, // Necessary for components outside Modal (portal stuff)
    savePartialy, // Define if should save on partial form changes
    children,
}) => {
    const validatorRef = React.useRef(null);
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
            console.log('(metadata:123) - @@@@@@ formState: ', formState);
            let isValid = true;
            console.log('(metadata:121) - @@@@@@ validatorRef.current: ', validatorRef.current);
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

            if (onDataChanged) onDataChanged(formState, isValid)
        },

        setShouldSave: (shouldSave) => {
            if (!savePartialy) return

            dispatch({ type: 'set_should_save', shouldSave })
        },

        setFields: (fields) => dispatch({ type: 'set_fields', fields }),
        setEditingTag: (editingTag) => dispatch({ type: 'set_editing_tag', editingTag }),
        setJsonSchema: (jsonSchema) => dispatch({ type: 'set_json_schema', jsonSchema })
    }), [])

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

        actions.setFormState(new Map())
    }, [node]);


    React.useEffect(() => {
        if(state.saving) return;

        const metadata = node.getMetadata()
        console.log('(metadata:189) - @@@@@@ metadata: ', metadata);
        actions.setFormState(metadata)
    }, [node.getPath(), state.saving]);


    React.useEffect(() => {
        if (Object.keys(state.errors).length > 0) return;

        if (validatorRef.current) {
            validatorRef.current(
                formatSpecialCasesForValidation(
                    state.formState,
                    validatorRef.current.schema
                )
            )
            const errors = mapErrors(validatorRef.current.errors)
            dispatch({ type: 'set_errors', errors })
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
