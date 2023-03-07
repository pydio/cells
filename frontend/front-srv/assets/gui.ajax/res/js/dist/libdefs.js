/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

const PydioCoreRequires = {
    'lang/Observable.js'        :'pydio/lang/observable',
    'lang/Logger.js'            :'pydio/lang/logger',
    'util/LangUtils.js'         :'pydio/util/lang',
    'util/FuncUtils.js'         :'pydio/util/func',
    'util/XMLUtils.js'          :'pydio/util/xml',
    'util/PathUtils.js'         :'pydio/util/path',
    'util/HasherUtils.js'       :'pydio/util/hasher',
    'util/PassUtils.js'         :'pydio/util/pass',
    'util/DOMUtils.js'          :'pydio/util/dom',
    'util/CookiesManager.js'    :'pydio/util/cookies',
    'util/PeriodicalExecuter.js':'pydio/util/periodical-executer',
    'util/ActivityMonitor.js'   :'pydio/util/activity-monitor',
    'model/AjxpNode.js'         :'pydio/model/node',
    'model/User.js'             :'pydio/model/user',
    'model/RemoteNodeProvider.js':'pydio/model/remote-node-provider',
    'model/EmptyNodeProvider.js':'pydio/model/empty-node-provider',
    'model/MetaNodeProvider.js':'pydio/model/meta-node-provider',
    'model/Repository.js'       :'pydio/model/repository',
    'model/Action.js'           :'pydio/model/action',
    'model/Controller.js'       :'pydio/model/controller',
    'model/PydioDataModel.js'   :'pydio/model/data-model',
    'model/Registry.js'         :'pydio/model/registry',
    'model/ContextMenu'         :'pydio/model/context-menu',
    'model/CellModel'           :'pydio/model/cell',
    'model/IdmObjectHelper'     :'pydio/model/idm-object-helper',
    'http/Connexion.js'         :'pydio/http/connexion',
    'http/ResourcesManager.js'  :'pydio/http/resources-manager',
    'http/PydioApi.js'          :'pydio/http/api',
    'http/SearchApi.js'         :'pydio/http/search-api',
    'http/PydioUsersApi.js'     :'pydio/http/users-api',
    'http/MetaCacheService.js'  :'pydio/http/meta-cache-service',
    'http/PydioWebSocket.js'    :'pydio/http/websocket',
    'http/Policies.js'          :'pydio/http/policies',
    'Pydio'                     :'pydio'
};

const LibRequires = [ // modules we want to require and export
    'react',
    'react-dom',
    'react-addons-pure-render-mixin',
    'react-addons-css-transition-group',
    'react-addons-update',
    'material-ui',
    'material-ui/styles',
    'color',
    'react-infinite',
    'react-draggable',
    'react-redux',
    'react-dnd',
    'create-react-class',
    'prop-types',
    'react-dnd-html5-backend',
    'react-textfit',
    'lodash/flow',
    'lodash',
    'lodash.debounce',
    'classnames',
    'clipboard',
    'qrcode.react',
    'whatwg-fetch',
    'systemjs',
    'redux',
    'react-markdown',
    'cells-sdk'
];

const Externals = Object.keys(PydioCoreRequires).map(function(key){
    return PydioCoreRequires[key];
}).concat(LibRequires);

const DistConfig = {
    PydioCoreRequires,
    LibRequires,
    Externals
};

module.exports = DistConfig;