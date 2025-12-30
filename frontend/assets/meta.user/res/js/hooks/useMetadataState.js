/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { isEqual } from 'lodash'
import MetaClient from "../MetaClient";
import {useValidation} from "./useValidation";

const collectUserMeta = (node) => {
    return new Map(Array.from(node.getMetadata())
        .filter(([k]) => k.startsWith('usermeta')));
}

/**
 * Custom hook to manage metadata state and operations
 */
export const useMetadataState = ({
    node,
    loader,
    loadChecks,
    onChangeUpdateData,
    autoSave,
    errorsScope,
}) => {
    const [updateMeta, setUpdateMeta] = useState(() => collectUserMeta(node));
    const [fields, setFields] = useState({});
    const [configs, setConfigs] = useState(new Map());
    const [namespaceJsonSchema, setNamespaceJsonSchema] = useState();
    const pendingSubmitRef = useRef(false);

    useEffect(() => {
        if (!node) return

        MetaClient
            .getInstance()
            .getNamespaceSchema()
            .then(ns => setNamespaceJsonSchema(ns.JsonSchema))
    }, [node.getPath()]);

    // Load configs and initialize state
    useEffect(() => {
        const promsConfigs = loader ? loader() : MetaClient.getInstance().loadConfigs();
        promsConfigs.then(newConfigs => {

            const fields = {};
            const updateMeta = new Map();
            if (loadChecks) {
                newConfigs.forEach((_, key) => {
                    if (node.getMetadata().has(key)) {
                        fields[key] = true;
                        updateMeta.set(key, node.getMetadata().get(key));
                    }
                });
            }

            setConfigs(prev => {
                if (isEqual(Array.from(newConfigs.keys()), Array.from(prev.keys()))) {
                    return prev;
                }
                return newConfigs;
            });
            setFields(fields);

            // Only reset updateMeta if it's currently empty (initial load)
            // This prevents resetting pending changes when node prop updates
            setUpdateMeta(prev => prev.size === 0 ? updateMeta : prev);
        });
    }, [loader, node, loadChecks]);

    // Trigger autoSave after updateMeta state has been updated
    useEffect(() => {
        if (pendingSubmitRef.current && autoSave) {
            pendingSubmitRef.current = false;
            autoSave();
        }
    }, [updateMeta, autoSave]);

    const {validate, valid, errors, globalErrors, globalValidate} = useValidation({
        configs,
        namespaceJsonSchema
    });

    useEffect(() => {
        const newConfigs = new Map(configs);
        configs.forEach(config => {
            config.errorText = null
            if(!valid && errors && errorsScope === 'local') {
                if (config.ns && errors[config.ns]) {
                    config.errorText = errors[config.ns]
                }
            } else if(!valid && globalErrors && errorsScope === 'global') {
                if (config.ns && globalErrors[config.ns]) {
                    config.errorText = globalErrors[config.ns]
                }
            }
            newConfigs.set(config.ns, config);
        })
        setConfigs(newConfigs);
    }, [errors, globalErrors, errorsScope, valid, node]);


    const updateValue = useCallback((name, value, submit = false) => {
        setUpdateMeta(prev => {
            const newMap = new Map(prev);
            newMap.set(name, value);
            // This performs both a global validation and a validation only on "touched" fields
            validate(Object.fromEntries(newMap), Array.from(newMap.keys()));
            if (onChangeUpdateData) {
                onChangeUpdateData(newMap);
            }
            return newMap;
        });
        if (submit && autoSave) {
            // Mark that we need to submit after state updates
            pendingSubmitRef.current = true;
        }
    }, [onChangeUpdateData, autoSave, validate]);

    const deleteValue = useCallback((name) => {
        setUpdateMeta(prev => {
            const newMap = new Map(prev);
            newMap.delete(name);
            if (onChangeUpdateData) {
                onChangeUpdateData(newMap);
            }
            return newMap;
        });
    }, [onChangeUpdateData]);

    const getUpdateData = useCallback(() => {
        return updateMeta;
    }, [updateMeta]);

    const resetUpdateData = useCallback(() => {
        const newMap = new Map();
        setUpdateMeta(newMap);
        if (onChangeUpdateData) {
            onChangeUpdateData(newMap);
        }
    }, [onChangeUpdateData]);

    const onCheck = useCallback((key, value) => {
        setFields(prev => ({
            ...prev,
            [key]: value
        }));
        if (!value) {
            deleteValue(key);
        }
    }, [deleteValue]);

    return {
        updateMeta,
        fields,
        configs,
        updateValue,
        deleteValue,
        getUpdateData,
        resetUpdateData,
        onCheck,
        valid,
        errors,
        globalErrors,
        globalValidate,
    };
};
