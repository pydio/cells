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

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _httpMetaCacheService = require('../http/MetaCacheService');

var _httpMetaCacheService2 = _interopRequireDefault(_httpMetaCacheService);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _utilPathUtils = require('../util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _utilXMLUtils = require('../util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

var _langLogger = require('../lang/Logger');

var _langLogger2 = _interopRequireDefault(_langLogger);

var _AjxpNode = require('./AjxpNode');

var _AjxpNode2 = _interopRequireDefault(_AjxpNode);

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */

var RemoteNodeProvider = (function () {

  /**
   * Constructor
   */

  function RemoteNodeProvider() {
    var properties = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, RemoteNodeProvider);

    this.discrete = false;
    if (properties) this.initProvider(properties);
  }

  /**
   * Initialize properties
   * @param properties Object
   */

  RemoteNodeProvider.prototype.initProvider = function initProvider(properties) {
    this.properties = new Map();
    for (var p in properties) {
      if (properties.hasOwnProperty(p)) this.properties.set(p, properties[p]);
    }
    if (this.properties && this.properties.has('connexion_discrete')) {
      this.discrete = true;
      this.properties['delete']('connexion_discrete');
    }
    if (this.properties && this.properties.has('cache_service')) {
      this.cacheService = this.properties.get('cache_service');
      this.properties['delete']('cache_service');
      _httpMetaCacheService2['default'].getInstance().registerMetaStream(this.cacheService['metaStreamName'], this.cacheService['expirationPolicy']);
    }
  };

  /**
   * Load a node
   * @param node AjxpNode
   * @param nodeCallback Function On node loaded
   * @param childCallback Function On child added
   * @param recursive
   * @param depth
   * @param optionalParameters
   */

  RemoteNodeProvider.prototype.loadNode = function loadNode(node) {
    var nodeCallback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var childCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
    var recursive = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
    var depth = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
    var optionalParameters = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
  };

  /**
   * Load a node
   * @param node AjxpNode
   * @param nodeCallback Function On node loaded
   * @param aSync bool
   * @param additionalParameters object
   */

  RemoteNodeProvider.prototype.loadLeafNodeSync = function loadLeafNodeSync(node, nodeCallback) {
    var aSync = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var additionalParameters = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  };

  RemoteNodeProvider.prototype.refreshNodeAndReplace = function refreshNodeAndReplace(node, onComplete) {};

  /**
   * Parse the answer and create AjxpNodes
   * @param origNode AjxpNode
   * @param transport Ajax.Response
   * @param nodeCallback Function
   * @param childCallback Function
   * @param childrenOnly
   */

  RemoteNodeProvider.prototype.parseNodes = function parseNodes(origNode, transport, nodeCallback, childCallback, childrenOnly) {};

  RemoteNodeProvider.prototype.parseAjxpNodesDiffs = function parseAjxpNodesDiffs(xmlElement, targetDataModel, targetRepositoryId) {
    var setContextChildrenSelected = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
  };

  /**
   * Parses XML Node and create AjxpNode
   * @param xmlNode XMLNode
   */

  RemoteNodeProvider.prototype.parseAjxpNode = function parseAjxpNode(xmlNode) {};

  return RemoteNodeProvider;
})();

exports['default'] = RemoteNodeProvider;
module.exports = exports['default'];
