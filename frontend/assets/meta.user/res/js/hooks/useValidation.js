import React, {useState, useEffect, useCallback} from 'react'
import testSchema from '../test-schema.json';
import testSchemaLocal from '../test-schema-local.json'


import Ajv from "ajv";
import addFormats from 'ajv-formats'

const ajv = new Ajv({allErrors: true});
addFormats(ajv)

const parseErrors = (errors, configs) => {
    const result = {}

    errors.map(error => {
        let ns;
        switch (error.keyword) {
            case 'required':
                ns = error.params.missingProperty
                break;
            default:
                ns = error.instancePath.replace('/','')
                break;
        }
        result[ns] = error.message
    })
    return result
}

export const useValidation = ({configs}) => {

    const [validate, setValidate] = useState(undefined);
    const [valid, setValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [globalErrors, setGlobalErrors] = useState({});

    const [locals, setLocals] = useState({});

    useEffect(() => {
        const schemeClone = JSON.parse(JSON.stringify(testSchema));
        // Declare all fields are required!
        Object.entries(configs).map(([ns, cfg])=>{schemeClone.required.push(ns)})
        const valid = ajv.compile(schemeClone)
        setValidate(() => valid)

        const locals = {}
        for(const prop in testSchemaLocal.properties){
            locals[prop] = ajv.compile(testSchemaLocal);
        }
        setLocals(locals);

    }, [configs]);

    const globalValidate = useCallback((values) => {
        if(!validate) return false;
        const res = validate(values)
        setValid(res)
        if(!res) {
            setGlobalErrors({root: validate.errors, ...parseErrors(validate.errors)});
        } else {
            setGlobalErrors({})
        }
        return res;
    }, [validate]);

    const localValidate = useCallback((values, namespaces = []) => {
        globalValidate(values)
        const nsErrors = {}
        namespaces.forEach((namespace) => {
            if(!locals[namespace]) {
                return {valid: true}
            }
            const validator = locals[namespace];
            if(!validator(values)) {
                nsErrors[namespace] = parseErrors(validator.errors)[namespace]
            }
        })
        setErrors(nsErrors);
    }, [locals, globalValidate]);

    return {valid, errors, globalErrors, globalValidate, validate: localValidate};
}