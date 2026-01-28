import * as React from 'react'

const initialState = {
    node: null,
    saving: false,
    valid: true,
    formState: new Map(),
    fields: {},
    namespaceJsonSchema: null,
    validators: {},
    shouldSave: false,
    editingTag: 'none',
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'set_node':
            return { ...state, node: action.node }
        case 'set_saving':
            return { ...state, saving: action.saving }
        case 'set_valid':
            return { ...state, valid: action.valid }
        case 'set_form_state':
            return { ...state, formState: action.formState }
        case 'set_fields':
            return { ...state, fields: action.fields }
        case 'set_namespace_schema':
            return { ...state, namespaceJsonSchema: action.namespaceJsonSchema }
        case 'set_validators':
            return { ...state, validators: action.validators }
        case 'merge_state':
            return { ...state, ...(action.value || {}) }
        case 'set_should_save':
            return { ...state, shouldSave: action.shouldSave }
        case 'set_editing_tag':
            return { ...state, editingTag: action.editingTag }
        default:
            return state
    }
}

const noop = () => {}

const defaultContext = {
    state: initialState,
    dispatch: noop,
    actions: {
        setSaving: noop,
        setValid: noop,
        setFormState: noop,
        setFields: noop,
        setNamespaceJsonSchema: noop,
        setValidators: noop,
        mergeState: noop,
        setShouldSave: noop,
        setEditingTag: noop
    }
}

export const MetadataContext = React.createContext(defaultContext)

export const MetadataContextProvider = ({
    node,
    saveMeta,
    value,
    children
}) => {
    const [state, dispatch] = React.useReducer(reducer, {
        ...initialState,
        node,
        ...(value || {})
    })

    const actions = React.useMemo(() => ({
        setSaving: (saving) => dispatch({ type: 'set_saving', saving }),
        setValid: (valid) => dispatch({ type: 'set_valid', valid }),
        setFormState: (formState) => {
            dispatch({ type: 'set_form_state', formState })
        },
        setFields: (fields) => dispatch({ type: 'set_fields', fields }),
        setNamespaceJsonSchema: (namespaceJsonSchema) =>
            dispatch({ type: 'set_namespace_schema', namespaceJsonSchema }),
        setValidators: (validators) => dispatch({ type: 'set_validators', validators }),
        mergeState: (nextValue) => dispatch({ type: 'merge_state', value: nextValue }),
        setShouldSave: (shouldSave) => dispatch({ type: 'set_should_save', shouldSave }),
        setEditingTag: (editingTag) => dispatch({ type: 'set_editing_tag', editingTag })
    }), [])

    React.useEffect(() => {
        if(state.saving) return;

        const metadata = node.getMetadata()
        actions.setFormState(metadata)
    }, [node.getPath(), state.saving]);


    React.useEffect(() => {
        if (state.shouldSave && saveMeta) {
            actions.setSaving(true)
            saveMeta(state.formState).then((res) => {
                actions.setSaving(false)
                actions.setShouldSave(false)
                node.replaceMetadata(state.formState, true);
            })
        }
    }, [state.shouldSave])

    React.useEffect(() => {
        if (value) {
            dispatch({ type: 'merge_state', value })
        }
    }, [value])

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
