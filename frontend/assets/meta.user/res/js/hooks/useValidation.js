import React, {useState, useEffect, useCallback, useRef} from 'react'

import { 
    parseValueForValidation,
    parseErrors
} from '../utils/jsonSchema';

import Ajv from "ajv";
import addFormats from 'ajv-formats'

const ajv = new Ajv({allErrors: true});
addFormats(ajv)

export const useValidation = ({configs, namespaceJsonSchema}) => {
    const jsonSchemaRef = useRef();
    const [valid, setValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [globalErrors, setGlobalErrors] = useState();

    useEffect(() => {
        if (!configs || !configs.size || jsonSchemaRef.current || !namespaceJsonSchema) {
            return
        }

        const userMetaJsonSchemaValidator = ajv.compile(namespaceJsonSchema)

        const propertyValidator = Object
            .entries(namespaceJsonSchema.properties)
            .reduce((acc, [ns, cfg]) => {
                return ({ ...acc, [ns]: ajv.compile(cfg) })
            }, {});

        // Store in the ref to avoid re-rendering
        jsonSchemaRef.current = { userMetaJsonSchemaValidator, propertyValidator };
    }, [configs, jsonSchemaRef.current, namespaceJsonSchema]);

    const globalValidate = useCallback((values) => {
        if(!jsonSchemaRef.current) return false;

        const { userMetaJsonSchemaValidator } = jsonSchemaRef.current;
        const parsedValues = Object.entries(values)
            .filter(([ns]) => userMetaJsonSchemaValidator.schema.properties[ns])
            .reduce((acc, [ns, val]) => ({ 
                ...acc,
                [ns]: parseValueForValidation(
                    userMetaJsonSchemaValidator.schema.properties[ns],
                    val
                ) 
            }), {});

        const isValid = userMetaJsonSchemaValidator(parsedValues)
        setValid(isValid)
        if(!isValid) {
            setGlobalErrors({ 
                root: userMetaJsonSchemaValidator.errors, 
                ...parseErrors(userMetaJsonSchemaValidator.errors)
            });
            return false;
        } 
        return isValid;
    }, [jsonSchemaRef.current]);

    useEffect(() => {
        // NOTE: to initialize globalErrors so it shows 
        // them if case of submit
        globalValidate({});
    }, [globalValidate]);

    const localValidate = useCallback((values, namespaces = []) => {
        globalValidate(values)
        const nsErrors = {}
        namespaces.forEach((namespace) => {
            const { propertyValidator } = jsonSchemaRef.current || {};
            if(!propertyValidator || !propertyValidator[namespace]) {
                return;
            }

            const validator = propertyValidator[namespace];
            if(!validator) return;

            const value = parseValueForValidation(validator.schema, values[namespace]);
            if(!validator(value)) {
                nsErrors[namespace] = (validator.errors || [])[0].message
            }
        })
        setErrors(nsErrors);
    }, [jsonSchemaRef.current, globalValidate]);

    return {valid, errors, globalErrors, globalValidate, validate: localValidate};
}
