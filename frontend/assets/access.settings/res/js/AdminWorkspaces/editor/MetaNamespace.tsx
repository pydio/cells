/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, { Fragment, useState, useEffect, useRef } from 'react';
import Pydio from 'pydio';
import { Dialog, FlatButton, Toggle } from 'material-ui';
import { muiThemeable } from 'material-ui/styles';
import { MantineProvider } from '@mantine/core';
import {
    IdmUserMetaNamespace,
    ServiceResourcePolicy,
    UserMetaServiceApi,
} from 'cells-sdk';
import Metadata from '../model/Metadata';
import PydioApi from 'pydio/http/api';
import MetaNamespaceFieldOptions, {
    MetaNamespaceFieldOptionsHandle,
} from './MetaNamespaceFieldOptions';
import BoxContainer from '../../AdminComponents/cards/BoxContainer';
import FuncUtils from 'pydio/util/func';
import ResourcesManager from 'pydio/http/resources-manager';

const { ModernTextField, ModernAutoComplete, ThemedModernStyles } =
    Pydio.requireLib('hoc');

// --- Types ---

interface MetaPoliciesBuilderProps {
    readonly?: boolean;
    policies?: ServiceResourcePolicy[];
    pydio: any;
    muiTheme?: any;
    onChangePolicies: (policies: ServiceResourcePolicy[]) => void;
}

interface MetaNamespaceProps {
    open: boolean;
    namespace: IdmUserMetaNamespace;
    namespaces: IdmUserMetaNamespace[];
    create?: boolean;
    reloadList?: () => void;
    onRequestClose: () => void;
    readonly?: boolean;
    pydio: any;
    muiTheme?: any;
    policiesBuilder?: string;
}

// --- Constants ---

const TYPES_WITHOUT_DEFAULTS: string[] = [
    'tags',
    'tag_cloud',
    'auto_complete',
    'url',
    'stars_rate',
    'css_label',
    'json',
    'boolean',
    'choice',
    'date',
];

// --- Helpers ---

export function getGroupValue(namespace: IdmUserMetaNamespace): string {
    try {
        return (JSON.parse(namespace.JsonDefinition as string) as { groupName?: string }).groupName || '';
    } catch (e) {
        return '';
    }
}

export async function loadEditorClass(
    className: string = '',
    defaultComponent: React.ComponentType<any>,
): Promise<React.ComponentType<any>> {
    if (!className) {
        return defaultComponent;
    }
    const parts = className.split('.');
    const ns = parts.shift() as string;
    const rest = parts.join('.');
    try {
        const c: any = await ResourcesManager.loadClass(ns);
        const comp = FuncUtils.getFunctionByName(rest, c);
        if (comp) return comp;
        // Fallback: check nested namespace object (e.g. c.ReactMeta.SomeEditor)
        if (typeof c === 'object' && c[ns]) {
            const c2 = FuncUtils.getFunctionByName(rest, c[ns]);
            if (c2) return c2;
        }
        if (defaultComponent) {
            console.error('Cannot find editor component, using default instead', className);
            return defaultComponent;
        }
        throw new Error('cannot find editor component');
    } catch (e: unknown) {
        if (defaultComponent) {
            console.error('Cannot find editor component, using default instead', className);
            return defaultComponent;
        }
        throw e;
    }
}

// --- MetaPoliciesBuilder ---

const MetaPoliciesBuilderInner: React.FC<MetaPoliciesBuilderProps> = ({
    readonly,
    policies,
    pydio,
    muiTheme,
    onChangePolicies,
}) => {
    const m = (id: string) => pydio.MessageHash['ajxp_admin.metadata.' + id] || id;
    const ModernStyles = ThemedModernStyles(muiTheme);

    const togglePolicies = (right: string, value: boolean): void => {
        let newPols = (policies || []).filter((p) => p.Action !== right);
        newPols.push(
            ServiceResourcePolicy.constructFromObject({
                Action: right,
                Effect: 'allow',
                Subject: value ? 'profile:admin' : '*',
            }),
        );
        if (right === 'READ' && value) {
            newPols = newPols.filter((p) => p.Action !== 'WRITE');
            newPols.push(
                ServiceResourcePolicy.constructFromObject({
                    Action: 'WRITE',
                    Effect: 'allow',
                    Subject: 'profile:admin',
                }),
            );
        }
        onChangePolicies(newPols);
    };

    let adminRead: boolean | undefined, adminWrite: boolean | undefined;
    if (policies) {
        policies.forEach((p) => {
            if (p.Subject === 'profile:admin' && p.Action === 'READ') adminRead = true;
            if (p.Subject === 'profile:admin' && p.Action === 'WRITE') adminWrite = true;
        });
    }

    return (
        <Fragment>
            <div>
                <Toggle
                    label={m('toggle.read')}
                    disabled={readonly}
                    labelPosition={'left'}
                    toggled={adminRead}
                    onToggle={(_e: unknown, v: boolean) => togglePolicies('READ', v)}
                    {...ModernStyles.toggleFieldV2}
                />
            </div>
            <div>
                <Toggle
                    label={m('toggle.write')}
                    labelPosition={'left'}
                    disabled={adminRead || readonly}
                    toggled={adminWrite}
                    onToggle={(_e: unknown, v: boolean) => togglePolicies('WRITE', v)}
                    {...ModernStyles.toggleFieldV2}
                />
            </div>
        </Fragment>
    );
};

const MetaPoliciesBuilder = muiThemeable()(MetaPoliciesBuilderInner) as React.ComponentType<MetaPoliciesBuilderProps>;

// --- Helpers (module-level, no state dependency) ---

function cloneNs(ns: IdmUserMetaNamespace): IdmUserMetaNamespace {
    return IdmUserMetaNamespace.constructFromObject(JSON.parse(JSON.stringify(ns)));
}

// --- MetaNamespace ---

const MetaNamespaceInner: React.FC<MetaNamespaceProps> = ({
    open,
    namespace: namespaceProp,
    namespaces,
    create,
    reloadList,
    onRequestClose,
    readonly,
    pydio,
    muiTheme,
    policiesBuilder,
}) => {
    const [namespace, setNamespace] = useState<IdmUserMetaNamespace>(() => cloneNs(namespaceProp));
    const [entityValues, setEntityValues] = useState<string[]>([]);
    const [isClosedValues, setIsClosedValues] = useState(false);
    const [PoliciesBuilder, setPoliciesBuilder] = useState<React.ComponentType<MetaPoliciesBuilderProps>>(
        () => MetaPoliciesBuilder,
    );
    const [metaModule, setMetaModule] = useState<any>(undefined);
    const [types, setTypes] = useState<any>(undefined);
    const [sessionKey, setSessionKey] = useState(0);

    const fieldOptionsRef = useRef<MetaNamespaceFieldOptionsHandle>(null);
    const prevOpenRef = useRef(open);
    const prevCreateRef = useRef(create);

    const m = (id: string): string =>
        pydio.MessageHash['ajxp_admin.metadata.' + id] || id;

    const ModernStyles = ThemedModernStyles(muiTheme);

    // --- Data loading ---

    const loadTypes = async (): Promise<void> => {
        const res: any = await Metadata.getMetaSchema('types');
        const schema = res.JsonSchema;
        
        setTypes(Array.isArray(schema) ? schema.filter(Boolean) : schema);
    };

    // Load ReactMeta module once on mount
    useEffect(() => {
        const init = async () => {
            const c: any = await ResourcesManager.loadClass('ReactMeta');
            setMetaModule(c);
            if (policiesBuilder) {
                const comp = await loadEditorClass(policiesBuilder, MetaPoliciesBuilder);
                setPoliciesBuilder(() => comp);
            }
        };
        init();
    }, []);

    // Fires when `open` or `create` changes.
    useEffect(() => {
        const openChanged = prevOpenRef.current !== open;
        const createChanged = prevCreateRef.current !== create;

        prevOpenRef.current = open;
        prevCreateRef.current = create;

        // Only initialize when the dialog is open and something meaningful changed
        if (!open || (!openChanged && !createChanged)) return;

        // Load types lazily on first open
        if (!types) {
            loadTypes();
        }

        let newNS: IdmUserMetaNamespace;

        if (create) {
            // Build a guaranteed-blank namespace — never clone the prop in create
            // mode as it may carry stale data from a previously-opened edit dialog.
            newNS = IdmUserMetaNamespace.constructFromObject({
                Policies: namespaceProp.Policies,
                Indexable: namespaceProp.Indexable ?? true,
                Order: namespaces.length
                    ? Math.max(...namespaces.map((ns) => ns.Order || 0)) + 1
                    : 0,
            });
        } else {
            // Edit mode: clone the prop so local edits don't mutate the parent.
            newNS = cloneNs(namespaceProp);
        }

        setNamespace(newNS);
        // Reset ephemeral state for a fresh dialog
        setEntityValues([]);
        // Increment so TypeEditor (which holds its own internal state for label/
        // namespace and only reads props on mount) gets fully remounted clean.
        setSessionKey((k) => k + 1);
    }, [open, create]);

    // The "Disable new values" flag is not stored on the namespace: it is
    // materialized as a restrictive WRITE policy (profile:admin) on the backing
    // entity — see save(). Resolve it back from the entity list. Runs in its own
    // effect (not the init effect above) so it also fires when the component is
    // mounted with the dialog already open, as MetadataBoard does in edit mode.
    useEffect(() => {
        setIsClosedValues(false);
        if (!open || create || !namespaceProp.EntityUUID) return;

        let stale = false;
        Metadata.listEntities()
            .then((entities: any[]) => {
                if (stale) return;
                const entity = entities.find((e) => e.Uuid === namespaceProp.EntityUUID);
                const closed = !!entity?.Policies?.some(
                    (p: ServiceResourcePolicy) =>
                        p.Action === 'WRITE' &&
                        p.Effect === 'allow' &&
                        p.Subject === 'profile:admin',
                );
                console.log('Resolved isClosedValues for', namespaceProp.Namespace, 'to', closed);
                setIsClosedValues(closed);
            })
            .catch(() => {
                // Leave the toggle off if the entity list cannot be loaded
            });
        return () => {
            stale = true;
        };
    }, [open, create, namespaceProp]);

    // --- JSON schema helpers ---

    // Accepts an explicit ns so callers can pass freshly-set state before React re-renders
    const getJsonSchema = async (ns: IdmUserMetaNamespace = namespace): Promise<unknown> => {
        if (!(ns.JsonDefinition as string)?.length) return undefined;

        const parsed = JSON.parse(ns.JsonDefinition as string);
        const fieldType: string = parsed.type;
        const data = parsed.data || '';

        if (!fieldType || !ns.Namespace) return undefined;

        const format = data?.format?.toString().length > 0 ? data.format : '';
        const schema = await Metadata.getJsonSchemaByType(fieldType, ns.Namespace, format);
        setNamespace((prev) => ({ ...prev, JsonSchema: schema.JsonSchema }));
        return schema.JsonSchema;
    };

    // --- Namespace field helpers ---

    const getHideValue = (): boolean => {
        try {
            return JSON.parse(namespace.JsonDefinition as string).hide;
        } catch (e) {
            return false;
        }
    };

    const setHideValue = (v: boolean) => {
        const def = JSON.parse(namespace.JsonDefinition as string);
        setNamespace((prev) => ({ ...prev, JsonDefinition: JSON.stringify({ ...def, hide: v }) }));
    };

    const setGroupValue = (v: string) => {
        const def = JSON.parse(namespace.JsonDefinition as string);
        setNamespace((prev) => ({ ...prev, JsonDefinition: JSON.stringify({ ...def, groupName: v }) }));
    };

    const getAdditionalData = (defaultValue: Record<string, any> = {}): Record<string, any> => {
        try {
            const add = JSON.parse(namespace.JsonDefinition as string).data || defaultValue;
            if (defaultValue.items && typeof add === 'string' && add.split) {
                const items = add.split(',').map((i: string) => {
                    const [key, value] = i.split('|');
                    return { [key]: value };
                });
                return { items };
            }
            return add;
        } catch (e) {
            console.error('Failed to parse additional data:', e);
        }

        return defaultValue;
    };

    const setEntityValuesFromStr = (valueStr: string) => {
        const def = JSON.parse(namespace.JsonDefinition as string);
        const entityItems = valueStr.split(',').map((s) => s.trim()).filter(Boolean);
        const data = { ...def.data, entityItems };
        setNamespace((prev) => ({ ...prev, JsonDefinition: JSON.stringify({ ...def, data }) }));
    };


    const getEntityItems = (): string[] | undefined => {
        try {
            const parsed = JSON.parse((namespace.JsonDefinition as string) || '{}');
            const entityItems = parsed?.data?.entityItems;
            return entityItems;
        } catch (e) {
            return undefined;
        }
    };

    const togglePolicies = (right: string, value: boolean) => {
        setNamespace((prev) => {
            const pol = prev.Policies || [];
            let newPols = pol.filter((p) => p.Action !== right);
            newPols.push(
                ServiceResourcePolicy.constructFromObject({
                    Action: right,
                    Effect: 'allow',
                    Subject: value ? 'profile:admin' : '*',
                }),
            );
            // When restricting READ, also restrict WRITE
            if (right === 'READ' && value) {
                newPols = newPols.filter((p) => p.Action !== 'WRITE');
                newPols.push(
                    ServiceResourcePolicy.constructFromObject({
                        Action: 'WRITE',
                        Effect: 'allow',
                        Subject: 'profile:admin',
                    }),
                );
            }
            return { ...prev, Policies: newPols };
        });
    };

    const toggleRequired = (ns: IdmUserMetaNamespace) => {
        if (!ns.JsonSchema) return;
        const required: string[] = ns.JsonSchema.required || [];
        const newRequired = required.length === 0 ? [ns.Namespace as string] : [];
        setNamespace((prev) => ({
            ...prev,
            JsonSchema: { ...prev.JsonSchema, required: newRequired },
        }));
    };

    // --- Save ---

    const save = async (): Promise<void> => {
        let ns = fieldOptionsRef.current
            ? fieldOptionsRef.current.getUpdatedNamespace()
            : namespace;
       
        // Step 1: If there's a definition but no compiled schema yet, derive it first
        const hasSchema = ns.JsonSchema && Object.keys(ns.JsonSchema).length > 0;
        if (!hasSchema && ns.JsonDefinition) {
            const jsonSchema = await getJsonSchema(ns);
            if (jsonSchema) {
                ns = { ...ns, JsonSchema: jsonSchema } as IdmUserMetaNamespace;
            }
        }
        const def = JSON.parse((ns.JsonDefinition as string) || '{}');
        const defType: string = def.type;
        ns.FieldType = defType;
        // Step 2: For entity-backed types, ensure the entity exists before saving
        const needsEntity =
            defType === 'tag_cloud' || defType === 'auto_complete' || defType === 'choice';
        const entityItems: string[] = def.data?.entityItems || [];

        if (needsEntity && !def.entity?.entity_id) {
            const r = await Metadata.createEntity(
                `Entity for ${ns.Namespace}`,
                ns.Description,
                isClosedValues
                    ? [
                        ServiceResourcePolicy.constructFromObject({
                            Action: 'WRITE',
                            Effect: 'allow',
                            Subject: 'profile:admin',
                        }),
                        ServiceResourcePolicy.constructFromObject({
                            Action: 'READ',
                            Effect: 'allow',
                            Subject: 'profile:standard',
                        }),
                    ]
                    : ns.Policies,
            );
            ns = {
                ...ns,
                EntityUUID: r.Uuid,
                // Spread the full existing def so type, data, and any other
                // fields are preserved — only entity is added/overwritten.
                JsonDefinition: JSON.stringify({ ...def, entity: { entity_id: r.Uuid } }),
            } as IdmUserMetaNamespace;
            setNamespace(ns);

            // Save namespace and entity values in parallel
            await Promise.all([
                Metadata.putNS(ns),
                ...(entityItems.length > 0
                    ? [Metadata.putEntityValues(r.Uuid, entityItems, [])]
                    : []),
            ]);
        } else {
            await Metadata.putNS(ns);
        }

        onRequestClose();
        reloadList?.();
    };

    // --- Render ---

    const configs = pydio.getPluginConfigs('access.settings');
    const USERMETA_PROMPT_FF = Boolean(configs.get('USERMETA_NAMESPACE_PROMPT'));

    if (!metaModule) return null;

    const { TypeEditor, TagsCloudInput } = metaModule;

    let type = '';
    if (namespace.JsonDefinition) {
        try {
            type = (JSON.parse(namespace.JsonDefinition as string).type as string) || '';
        } catch (e) {
            type = '';
        }
    }
    // Attach FieldType without mutating state — used for display checks below
    const displayNamespace = { ...namespace, FieldType: type };

    // --- Derived booleans for conditional rendering ---
    const isTagCloud = type === 'tag_cloud' || type === 'auto_complete';
    const showSchemaSection = create || !!namespace.JsonSchema;
    const showFieldOptions =
        USERMETA_PROMPT_FF &&
        !!namespace.Namespace?.toString().length &&
        !!namespace.JsonDefinition?.toString().length;
    const showEnforceDefault = TYPES_WITHOUT_DEFAULTS.indexOf(type) === -1;

    const title = namespace.Label || m('editor.title.create');

    let invalid = false;
    let nameError: string | undefined, labelError: string | undefined;
    if (!namespace.Label) {
        invalid = true;
        labelError = m('editor.label.error');
    } else if (!namespace.Namespace || namespace.Namespace === 'usermeta-') {
        invalid = true;
        nameError = m('editor.ns.error');
    }
    if (create && namespaces.filter((n) => n.Namespace === namespace.Namespace).length) {
        invalid = true;
        nameError = m('editor.ns.exists');
    }
    if (type === 'choice') {
        const choiceItems = getAdditionalData({ items: [] }).items;

        if (!choiceItems || !choiceItems.length) invalid = true;
    }
    if (!type) invalid = true;

    const knownGroups = [...new Set(namespaces.map((n) => getGroupValue(n)).filter((g) => g))];

    let adminRead: boolean | undefined, adminWrite: boolean | undefined;
    if (namespace.Policies) {
        namespace.Policies.forEach((p) => {
            if (p.Subject === 'profile:admin' && p.Action === 'READ') adminRead = true;
            if (p.Subject === 'profile:admin' && p.Action === 'WRITE') adminWrite = true;
        });
    }

    // --- Tag reset handler ---
    const handleResetTags = async () => {
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        try {
            await api.deleteUserMetaTags(namespace.Namespace, '*');
            pydio.UI.displayMessage(
                'SUCCESS',
                m('editor.tags.cleared').replace('%s', namespace.Namespace),
            );
        } catch (e: unknown) {
            pydio.UI.displayMessage('ERROR', (e as Error).message);
        }
    };

    const actions: React.ReactNode[] = [
        <FlatButton primary={true} label={pydio.MessageHash['54']} onClick={onRequestClose} />,
        <FlatButton
            primary={true}
            disabled={invalid || readonly}
            label={pydio.MessageHash['53']}
            onClick={save}
        />,
    ];
    if (type === 'tags' && !readonly) {
        actions.unshift(
            <FlatButton
                primary={false}
                label={m('editor.tags.reset')}
                onClick={handleResetTags}
            />,
        );
    }
    console.log({USERMETA_PROMPT_FF})
    const styles = { section: { marginTop: 10, fontWeight: 500, fontSize: 12 } };

    return (
        <Dialog
            title={title}
            actions={actions}
            modal={false}
            contentStyle={{ width: 520 }}
            open={open}
            onRequestClose={onRequestClose}
            autoScrollBodyContent={true}
            bodyStyle={{ padding: 20 }}
        >
            <TypeEditor
                key={sessionKey}
                m={m}
                pydio={pydio}
                namespace={displayNamespace}
                metaTypes={types}
                forcePrefix={'usermeta-'}
                onChange={async (ns: IdmUserMetaNamespace) => {
                    setNamespace(ns);
                    await getJsonSchema(ns);
                }}
                readonly={readonly}
                create={create}
                labelError={labelError}
                nameError={nameError}
                styles={styles}
            />
            <ModernTextField
                floatingLabelText={m('description')}
                value={namespace.Description || ''}
                onChange={(_e: unknown, v: string) =>
                    setNamespace((prev) => ({ ...prev, Description: v }))
                }
                fullWidth={true}
                readOnly={readonly}
                variant={'v2'}
            />

            {showSchemaSection && (
                <>
                    {isTagCloud && (
                        <MantineProvider>
                            <div style={{ ...styles.section }}>{'Values'}</div>
                            <BoxContainer p={16} mt={8} bg="rgb(246 246 248)">
                                <TagsCloudInput
                                    disabled={false}
                                    fz="lg"
                                    value={entityValues.join(', ')}
                                    readOnly={!create}
                                    dataLoader={
                                        create
                                            ? undefined
                                            : async () => {
                                                  const res: string[] = await Metadata.listTags(namespace.Namespace);
                                                  setEntityValues(res);
                                                  return res;
                                              }
                                    }
                                    onCommitChange={(v: string) => setEntityValuesFromStr(v)}
                                    hintText={m('tag_cloud.entity.hint')}
                                    {...ModernStyles.tagsCloudInputV2}
                                />
                            </BoxContainer>
                        </MantineProvider>
                    )}
                    {showFieldOptions && (
                        <MetaNamespaceFieldOptions
                            ns={namespace}
                            ref={fieldOptionsRef}
                            fieldType={JSON.parse(namespace.JsonDefinition as string).type}
                            tagValues={
                                isTagCloud
                                    ? getEntityItems()
                                    : getAdditionalData({ items: [] }).items
                            }
                        />
                    )}
                    <div style={{ marginTop: '8px', ...styles.section }}>
                        {Pydio.getInstance().MessageHash[310]}
                    </div>
                    {USERMETA_PROMPT_FF && (
                        <>
                            <Toggle
                                label={m('toggle.prompt')}
                                disabled={readonly}
                                labelPosition={'left'}
                                toggled={namespace.PromptOnUpload ?? false}
                                onToggle={(_e: unknown, v: boolean) => {
                                    setNamespace((prev) => ({ ...prev, PromptOnUpload: v }));
                                    if (!v) toggleRequired(namespace);
                                }}
                                {...ModernStyles.toggleFieldV2}
                            />
                            <Toggle
                                label={m('toggle.required')}
                                disabled={!namespace.PromptOnUpload}
                                labelPosition={'left'}
                                toggled={(namespace.JsonSchema?.required?.length ?? 0) > 0}
                                onToggle={() => toggleRequired(namespace)}
                                {...ModernStyles.toggleFieldV2}
                            />
                            {showEnforceDefault && (
                                <Toggle
                                    label={m('toggle.defaults')}
                                    labelPosition={'left'}
                                    toggled={namespace.EnforceDefault}
                                    onToggle={(_e: unknown, v: boolean) =>
                                        setNamespace((prev) => ({ ...prev, EnforceDefault: v }))
                                    }
                                    {...ModernStyles.toggleFieldV2}
                                />
                            )}
                            {type === 'tag_cloud' && (
                                <Toggle
                                label={'Disable new values'}
                                labelPosition={'left'}
                                toggled={isClosedValues}
                                onToggle={(_e: unknown, v: boolean) => setIsClosedValues(v)}
                                {...ModernStyles.toggleFieldV2}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            <Toggle
                label={m('toggle.list-visibility')}
                disabled={readonly}
                labelPosition={'left'}
                toggled={!getHideValue()}
                onToggle={(_e: unknown, v: boolean) => setHideValue(!v)}
                {...ModernStyles.toggleFieldV2}
            />
            <Toggle
                label={m('toggle.index')}
                disabled={readonly}
                labelPosition={'left'}
                toggled={namespace.Indexable}
                onToggle={(_e: unknown, v: boolean) =>
                    setNamespace((prev) => ({ ...prev, Indexable: v }))
                }
                {...ModernStyles.toggleFieldV2}
            />
            {PoliciesBuilder && (
                <PoliciesBuilder
                    policies={namespace.Policies}
                    readonly={readonly}
                    onChangePolicies={(pols) =>
                        setNamespace((prev) => ({ ...prev, Policies: pols }))
                    }
                    pydio={pydio}
                />
            )}
            <div style={styles.section}>{m('order')}</div>
            <ModernTextField
                floatingLabelText={m('order')}
                value={namespace.Order ?? '0'}
                onChange={(_e: unknown, v: string) =>
                    setNamespace((prev) => ({ ...prev, Order: parseInt(v) }))
                }
                fullWidth={true}
                type={'number'}
                readOnly={readonly}
                variant={'v2'}
            />
            <ModernAutoComplete
                floatingLabelFixed={true}
                fullWidth={true}
                floatingLabelText={m('group-field')}
                filter={(searchText: string, key: string) =>
                    !searchText.indexOf ||
                    key.toLowerCase().indexOf(searchText.toLowerCase()) === 0
                }
                openOnFocus={true}
                dataSource={knownGroups}
                searchText={getGroupValue(namespace) || ''}
                onNewRequest={(s: string) => setGroupValue(s)}
                onUpdateInput={(v: string) => setGroupValue(v)}
                menuProps={{ maxHeight: 300, overflowY: 'auto' }}
            />
        </Dialog>
    );
};

const MetaNamespace = muiThemeable()(MetaNamespaceInner) as React.ComponentType<MetaNamespaceProps>;

export default MetaNamespace;