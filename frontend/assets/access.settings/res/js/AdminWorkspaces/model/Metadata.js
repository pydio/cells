/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import PydioApi from 'pydio/http/api'
import {
    UserMetaServiceApi,
    IdmUserMetaNamespace,
    IdmMetaEntity,
    IdmEntityValue,
    IdmCreateEntityRequest,
    IdmCreateEntityValueRequest,
    IdmUpdateUserMetaNamespaceRequest,
    UpdateUserMetaNamespaceRequestUserMetaNsOp,

} from 'cells-sdk'


/** 
 * @typedef {import('cells-sdk').IdmUserMetaNamespace} IdmUserMetaNamespace
 * @typedef {import('cells-sdk').IdmUpdateUserMetaNamespaceRequest} IdmUpdateUserMetaNamespaceRequest
 * @typedef {import('cells-sdk').UpdateUserMetaNamespaceRequestUserMetaNsOp} UpdateUserMetaNamespaceRequestUserMetaNsOp 
*/

class Metadata {
    // Initialize Api instance statically to reuse across calls
    static api = new UserMetaServiceApi(PydioApi.getRestClient());

    //** @type {Promise<IdmUserMetaNamespace[]>} */
    static loadNamespaces() {
        return Metadata.api.listUserMetaNamespace();
    }

    /**
     * @param namespace {IdmUserMetaNamespace}
     * @return {Promise}
     */
    static putNS(namespace) {
        //** @type {Promise<IdmUserMetaNamespace>} */
        let request = new IdmUpdateUserMetaNamespaceRequest();
        request.Operation = UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('PUT');
        request.Namespaces = [namespace];
        Metadata.clearLocalCache();
        return Metadata.api.updateUserMetaNamespace(request)
    }

    /**
     * @param namespace {IdmUserMetaNamespace}
     * @return {Promise}
     */
    static deleteNS(namespace) {
        let request = new IdmUpdateUserMetaNamespaceRequest();
        request.Operation = UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('DELETE');
        request.Namespaces = [namespace];
        Metadata.clearLocalCache();
        return Metadata.api.updateUserMetaNamespace(request)
    }
    /**
     * 
     * @param {string} fileType 
     * @returns {Promise<any>}
     */
    static getMetaSchema(fileType) {
        //** @type {Promise<any>} */
        return Metadata.api.getFieldSchema(fileType);
    }

    static getJsonSchemaByType(fieldType, namespace, format = '') {     
        return Metadata.api.getNamespaceSchema({ FieldType: fieldType, Namespace: namespace, Format: format });
    }
    /**
     * @param namespace String
     * @return {Promise<Array>}
     */
    static listTags(namespace){

        return new Promise((resolve) => {
            Metadata.api.listUserMetaTags(namespace).then(response => {
                if(response.Tags){
                    resolve(response.Tags);
                } else {
                    resolve([]);
                }
            }).catch(e => {
                resolve([])
            })

        });

    }
    /**
     * Creates a new entity with the given description, label, and policies.
     * @param label String
     * @param description String
     * @param policies Array
     */
    static createEntity(label,description, policies) {
        if (!label) {
            throw new Error('Label is required to create an entity');
        }
        const entity = IdmMetaEntity.constructFromObject({
            Description: description || '',
            Label: label,
            Policies: policies || []
        });

        const request = IdmCreateEntityRequest.constructFromObject({
            Entity: entity,
        });

        return Metadata.api.putEntity(request).then(r => {
            console.log('Entity created', r);
            return r.Entity;
        }).catch(e => {
            console.error(e);
            throw e;
        });
    }
    /**
     * Creates entity values for a given entity with the same policies applied to all values
     * @param {string} entityId - The entity identifier
     * @param {string} entityUuid - The UUID of the parent entity
     * @param {string[]} values - Array of label strings for entity values to create
     * @param {Array<IdmPolicy>} policies - Access control policies applied to all entity values
     * @returns {Promise<void>} Promise resolving when all entity values are created
     * @throws {Error} If entityId or values array is empty
     * @example
     * Metadata.createEntity(
     *   'metadata-entity-1',
     *   '3c6b2e2f-3592-4cfc-a0d1-bb3059a5c986',
     *   ['x', 'xx', 'xxx'],
     *   [{id: '21', Resource: '...', Action: 'READ', Subject: '*', Effect: 'allow'}]
     * )
     */
    static putEntityValues(entityId, values, policies) {
         if (!values || values.length === 0) {
            throw new Error('Labels array is required and cannot be empty');
         }

        const evs = values.map(label => 
            IdmEntityValue.constructFromObject({
                Label: label,
                EntityUuid: entityId,
                Policies: policies || [],
            })
        );

        const request = IdmCreateEntityValueRequest.constructFromObject({
            EntityValue: evs
        });

        return Metadata.api.createEntityValues(request)
            .then(r => {
                console.log('Entity values created', r);
                return r;
            })
            .catch(e => {
                console.error(e);
                throw e;
            });
    }
    /**
     * Clear ReactMeta cache if it exists
     */
    static clearLocalCache() {
        try {
            if (window.ReactMeta) {
                ReactMeta.Renderer.getClient().clearConfigs();
            }
        } catch (e) {
            //console.log(e)
        }
    }
}

Metadata.MetaTypes = {
    "string": pydio.MessageHash['ajxp_admin.metadata.type.string'] || 'type.string',
    "textarea": pydio.MessageHash['ajxp_admin.metadata.type.textarea'] || 'type.textarea',
    "integer": pydio.MessageHash['ajxp_admin.metadata.type.integer'] || 'type.integer',
    "boolean": pydio.MessageHash['ajxp_admin.metadata.type.boolean'] || 'type.boolean',
    "date": pydio.MessageHash['ajxp_admin.metadata.type.date'] || 'type.date',
    "choice": pydio.MessageHash['ajxp_admin.metadata.type.choice'] || 'type.choice',
    "tags": pydio.MessageHash['ajxp_admin.metadata.type.tags'] || 'type.tags',
    "stars_rate": pydio.MessageHash['ajxp_admin.metadata.type.stars_rate'] || 'type.stars_rate',
    "css_label": pydio.MessageHash['ajxp_admin.metadata.type.css_label'] || 'type.css_label',
    "json": pydio.MessageHash['ajxp_admin.metadata.type.json'] || 'type.json',
    "url": pydio.MessageHash['ajxp_admin.metadata.type.url'] || 'type.url'
};

export { Metadata as default }
