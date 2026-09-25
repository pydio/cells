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

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
// @ts-expect-error Mantine's CSS import is resolved by the bundler.
import '@mantine/core/styles.css';
import { Form } from '@rjsf/mantine';
import { MantineProvider, createTheme } from '@mantine/core';
import Ajv from 'ajv';
import ajvMergePatch from 'ajv-merge-patch';
import addFormats from 'ajv-formats';
import validator from '@rjsf/validator-ajv8';
import { FormValidation } from '@rjsf/utils';
import Metadata from './../model/Metadata';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

interface IdmUserMetaNamespace {
    Namespace: string;
    JsonSchema?: unknown;
    [key: string]: unknown;
}

interface ChoiceTagValue {
    value: string;
}

type TagValue = string | ChoiceTagValue;

interface MetaNamespaceFieldOptionsProps {
    ns: IdmUserMetaNamespace;
    fieldType: string;
    tagValues?: TagValue[];
}

export interface MetaNamespaceFieldOptionsHandle {
    getUpdatedNamespace: () => IdmUserMetaNamespace;
}

type FormData = Record<string, unknown>;

interface JsonSchema {
    properties?: Record<string, unknown>;
    required?: string[];
    [key: string]: unknown;
}

interface PatchOp {
    op: string;
    path: string;
    value: unknown;
}

// --- AJV setup ---

const ajv = new Ajv();
addFormats(ajv);
ajvMergePatch(ajv);

// --- Theme ---

export const theme = createTheme({
    backgroundColor: '#f6f6f8',
    components: {
        NumberInput: {
            styles: () => ({
                rightSection: { display: 'none' },
                controls: { display: 'none' },
                input: {
                    paddingRight: '0 !important',
                    paddingLeft: '8px',
                },
            }),
        },
        Checkbox: {
            styles: (theme) => ({
                body: {
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                },
                input: {
                    borderColor: theme.colors.gray[5],
                    '&:checked': { borderColor: theme.colors.blue[6] },
                },
                label: {
                    fontSize: theme.fontSizes.sm,
                    color: theme.colors.dark[7],
                },
            }),
        },
    },
});

// --- Constants ---

const FIELD_TYPES_WITH_SCHEMA_PROPERTIES: string[] = [
    'string',
    'textarea',
    'integer',
    'tag_cloud',
    'choice',
    'auto_complete',
];

// --- Component ---

const MetaNamespaceFieldOptions = forwardRef<MetaNamespaceFieldOptionsHandle, MetaNamespaceFieldOptionsProps>(
    ({ ns, fieldType, tagValues }, ref) => {
        const [metaSchema, setSchema] = useState<JsonSchema>({});
        const [formData, setFormData] = useState<FormData>({});

        const hasValidNs =
            ns &&
            ns.JsonSchema &&
            (ns.JsonSchema as JsonSchema).properties?.[ns.Namespace] !== undefined;

        const m = (id: string): string =>
            (window as any).pydio?.MessageHash?.['ajxp_admin.metadata.' + id] ?? id;

        const formatMessage = (id: string, ...values: unknown[]): string =>
            values.reduce<string>(
                (message, value) => message.replace('%s', String(value)),
                m(id)
            );

        const uiSchema = {
            required: { 'ui:widget': 'hidden' },
        };

        const customValidate = (data: FormData, errors: FormValidation<FormData>) => {
            const minLength = data.minLength as number | undefined;
            const maxLength = data.maxLength as number | undefined;
            const minimum = data.minimum as number | undefined;
            const maximum = data.maximum as number | undefined;
            const defaultVal = data.default;

            if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
                errors.maxLength.addError(m('validation.max-length.gte-min-length'));
            }

            if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
                errors.maximum.addError(m('validation.max-value.gte-min-value'));
            }

            if (typeof defaultVal === 'string') {
                const len = defaultVal.length;
                if (minLength !== undefined && len < minLength) {
                    errors.default.addError(formatMessage('validation.default-length.min', len, minLength));
                }
                if (maxLength !== undefined && len > maxLength) {
                    errors.default.addError(formatMessage('validation.default-length.max', len, maxLength));
                }
            }

            if (typeof defaultVal === 'number') {
                if (minimum !== undefined && defaultVal < minimum) {
                    errors.default.addError(formatMessage('validation.default-value.min', defaultVal, minimum));
                }
                if (maximum !== undefined && defaultVal > maximum) {
                    errors.default.addError(formatMessage('validation.default-value.max', defaultVal, maximum));
                }
            }

            return errors;
        };

        const metaType = fieldType;

        useEffect(() => {
            if (!metaType || FIELD_TYPES_WITH_SCHEMA_PROPERTIES.indexOf(metaType) === -1) {
                return;
            }
            (async () => {
                const res = await Metadata.getMetaSchema(metaType);
                setSchema((res.JsonSchema as JsonSchema) || {});
            })();
        }, [metaType]);

        useEffect(() => {
            if (!hasValidNs) {
                return;
            }
            const schema = ns.JsonSchema as JsonSchema;
            const nsProperties = (schema.properties?.[ns.Namespace] as Record<string, unknown>) ?? {};
            const isRequired = (schema.required?.indexOf(ns.Namespace) ?? -1) !== -1;

            setFormData({ ...nsProperties, required: isRequired });
        }, [hasValidNs, ns]);

        useImperativeHandle(
            ref,
            () => ({
                getUpdatedNamespace: () => {
                    if (!formData || Object.keys(formData).length === 0) {
                        return ns;
                    }

                    let withOps: PatchOp[] = [];

                    if (metaType && FIELD_TYPES_WITH_SCHEMA_PROPERTIES.indexOf(metaType) !== -1) {
                        withOps = Object.keys(formData)
                            .filter((k) => k !== 'required')
                            .map((k) => ({
                                op: 'add',
                                path: `/properties/${ns.Namespace}/${k}`,
                                value: formData[k],
                            }));
                    }

                    if (
                        metaType === 'auto_complete' &&
                        Array.isArray(tagValues) &&
                        tagValues.length > 0
                    ) {
                        withOps.push({
                            op: 'add',
                            path: `/properties/${ns.Namespace}/items`,
                            value: { type: 'string', enum: tagValues as string[] },
                        });
                    }

                    if (metaType === 'choice' && Array.isArray(tagValues)) {
                        const vals = (tagValues as ChoiceTagValue[]).map((v) => v.value);
                        withOps.push({
                            op: 'add',
                            path: `/properties/${ns.Namespace}/items`,
                            value: { type: 'string', enum: vals },
                        });
                    }

                    if (withOps.length === 0) {
                        return ns;
                    }

                    const id = `https://schemas.pydio.com/string/patched/${uuidv4()}`;
                    const patchedSchema = {
                        $id: id,
                        $patch: { source: ns.JsonSchema, with: withOps },
                    };

                    try {
                        ajv.compile(patchedSchema);
                    } catch (e) {
                        console.error('Invalid patched schema:', e);
                    }

                    return { ...ns, JsonSchema: ns.JsonSchema };
                },
            }),
            [ns, formData, metaType, tagValues]
        );

        const hasValidationProperties =
            metaSchema.properties &&
            Object.keys(metaSchema.properties).some((key) => key !== 'required');

        const shouldRender =
            FIELD_TYPES_WITH_SCHEMA_PROPERTIES.indexOf(metaType) !== -1 &&
            hasValidNs &&
            hasValidationProperties;

        if (!shouldRender) {
            return null;
        }

        const handleChange = ({ formData: newFormData }: { formData?: FormData }) => {
            if (newFormData !== undefined) {
                setFormData(newFormData);
            }
        };

        return (
            <React.Fragment>
                <p style={{ marginTop: '10px', fontWeight: 500, fontSize: '12px' }}>
                    {m('field.validation')}
                </p>
                <MantineProvider theme={theme}>
                    <div
                        style={{
                            backgroundColor: 'rgb(246 246 248)',
                            padding: '20px',
                            borderRadius: '4px 4px 0px 0px',
                            marginTop: '10px',
                        }}
                    >
                        <Form
                            schema={metaSchema}
                            uiSchema={uiSchema}
                            validator={validator}
                            formData={formData}
                            onChange={handleChange}
                            customValidate={customValidate}
                            liveValidate
                            showErrorList={false}
                        >
                            <React.Fragment />
                        </Form>
                    </div>
                </MantineProvider>
            </React.Fragment>
        );
    }
);

export default MetaNamespaceFieldOptions;