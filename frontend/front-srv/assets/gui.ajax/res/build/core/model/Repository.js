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

var _httpResourcesManager = require('../http/ResourcesManager');

var _httpResourcesManager2 = _interopRequireDefault(_httpResourcesManager);

var _CellModel = require('./CellModel');

var _CellModel2 = _interopRequireDefault(_CellModel);

/** 
 * Container for a Repository.
 */

var Repository = (function () {

  /**
   * Constructor
   * @param id String
   * @param xmlDef XMLNode
   */

  function Repository(id, xmlDef) {
    _classCallCheck(this, Repository);

    this.label = '';
    this.id = id;
    this.accessType = '';
    this.nodeProviderDef = undefined;
    this.allowCrossRepositoryCopy = false;
    this.userEditable = false;
    this.slug = '';
    this.owner = '';
    this.description = '';
    this._hasContentFilter = false;
    this._hasUserScope = false;
    this._repositoryType = 'local';
    this._accessStatus = null;
    this._lastConnection = null;
    this.icon = '';
    this.resourcesManager = new _httpResourcesManager2['default']();
    this.loadedCell = null;
    if (xmlDef) this.loadFromXml(xmlDef);
  }

  Repository.isInternal = function isInternal(driverName) {
    return driverName === 'settings' || driverName === 'homepage';
  };

  /**
   * @returns String
   */

  Repository.prototype.getId = function getId() {
    return this.id;
  };

  /**
   * @returns String
   */

  Repository.prototype.getShareId = function getShareId() {
    return this.id.replace(/ocs_remote_share_/, '');
  };

  /**
   * @return {Promise<CellModel>}
   */

  Repository.prototype.asCell = function asCell() {
    var _this = this;

    if (!this.getOwner()) {
      return Promise.resolve(null);
    } else if (this.loadedCell) {
      return Promise.resolve(this.loadedCell);
    } else {
      var _ret = (function () {
        var cell = new _CellModel2['default']();
        return {
          v: new Promise(function (resolve, reject) {
            cell.load(_this.getId()).then(function (res) {
              _this.loadedCell = cell;
              resolve(cell);
            })['catch'](function (reason) {
              reject(reason);
            });
          })
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    }
  };

  /**
   * @returns String
   */

  Repository.prototype.getLabel = function getLabel() {
    return this.label;
  };

  /**
   * @param label String
   */

  Repository.prototype.setLabel = function setLabel(label) {
    this.label = label;
  };

  Repository.prototype.getLettersBadge = function getLettersBadge() {
    if (!this.label) return '';
    return this.label.split(" ").map(function (word) {
      return word.substr(0, 1);
    }).slice(0, 2).join("");
  };

  /**
   * @return String
   */

  Repository.prototype.getDescription = function getDescription() {
    return this.description;
  };

  /**
   * @returns String
   */

  Repository.prototype.getIcon = function getIcon() {
    return this.icon;
  };

  /**
   * @param icon String
   */

  Repository.prototype.setIcon = function setIcon(icon) {
    this.icon = icon;
  };

  /**
   * @return String
   */

  Repository.prototype.getOwner = function getOwner() {
    return this.owner;
  };

  /**
   * @returns String
   */

  Repository.prototype.getAccessType = function getAccessType() {
    return this.accessType;
  };

  /**
   * @param access String
   */

  Repository.prototype.setAccessType = function setAccessType(access) {
    this.accessType = access;
  };

  /**
   * Triggers ResourcesManager.load
   */

  Repository.prototype.loadResources = function loadResources() {
    this.resourcesManager.load(null, true);
  };

  /**
   * @returns Object
   */

  Repository.prototype.getNodeProviderDef = function getNodeProviderDef() {
    return this.nodeProviderDef;
  };

  /**
   * @param slug String
   */

  Repository.prototype.setSlug = function setSlug(slug) {
    this.slug = slug;
  };

  /**
   * @returns String
   */

  Repository.prototype.getSlug = function getSlug() {
    return this.slug;
  };

  Repository.prototype.getOverlay = function getOverlay() {
    return this.getOwner() ? _httpResourcesManager2['default'].resolveImageSource("shared.png", "overlays/ICON_SIZE", 8) : "";
  };

  /**
   * @returns {boolean}
   */

  Repository.prototype.hasContentFilter = function hasContentFilter() {
    return this._hasContentFilter;
  };

  /**
   * @returns {boolean}
   */

  Repository.prototype.hasUserScope = function hasUserScope() {
    return this._hasUserScope;
  };

  /**
   * @returns {string}
   */

  Repository.prototype.getRepositoryType = function getRepositoryType() {
    return this._repositoryType;
  };

  /**
   * @returns {string}
   */

  Repository.prototype.getAccessStatus = function getAccessStatus() {
    return this._accessStatus;
  };

  Repository.prototype.setAccessStatus = function setAccessStatus(status) {
    this._accessStatus = status;
  };

  Repository.prototype.getLastConnection = function getLastConnection() {
    return this._lastConnection;
  };

  /**
   * Parses XML Node
   * @param repoNode XMLNode
   */

  Repository.prototype.loadFromXml = function loadFromXml(repoNode) {
    if (repoNode.getAttribute('allowCrossRepositoryCopy') && repoNode.getAttribute('allowCrossRepositoryCopy') == "true") {
      this.allowCrossRepositoryCopy = true;
    }
    if (repoNode.getAttribute('hasContentFilter') && repoNode.getAttribute('hasContentFilter') == "true") {
      this._hasContentFilter = true;
    }
    if (repoNode.getAttribute('userScope') && repoNode.getAttribute('userScope') == "true") {
      this._hasUserScope = true;
    }
    if (repoNode.getAttribute('repository_type')) {
      this._repositoryType = repoNode.getAttribute('repository_type');
    }
    if (repoNode.getAttribute('access_status')) {
      this._accessStatus = repoNode.getAttribute('access_status');
    }
    if (repoNode.getAttribute('last_connection')) {
      this._lastConnection = repoNode.getAttribute('last_connection');
    }

    if (repoNode.getAttribute('user_editable_repository') && repoNode.getAttribute('user_editable_repository') == "true") {
      this.userEditable = true;
    }
    if (repoNode.getAttribute('access_type')) {
      this.setAccessType(repoNode.getAttribute('access_type'));
    }
    if (repoNode.getAttribute('repositorySlug')) {
      this.setSlug(repoNode.getAttribute('repositorySlug'));
    }
    if (repoNode.getAttribute('owner')) {
      this.owner = repoNode.getAttribute('owner');
    }
    for (var i = 0; i < repoNode.childNodes.length; i++) {
      var childNode = repoNode.childNodes[i];
      if (childNode.nodeName == "label") {
        this.setLabel(childNode.firstChild.nodeValue);
      } else if (childNode.nodeName == "description") {
        this.description = childNode.firstChild.nodeValue;
      } else if (childNode.nodeName == "client_settings") {
        if (childNode.getAttribute('icon_tpl_id')) {
          this.setIcon(window.pydio.Parameters.get('serverAccessPath') + '&get_action=get_user_template_logo&template_id=' + childNode.getAttribute('icon_tpl_id') + '&icon_format=small');
        } else {
          this.setIcon(childNode.getAttribute('icon'));
        }
        for (var j = 0; j < childNode.childNodes.length; j++) {
          var subCh = childNode.childNodes[j];
          if (subCh.nodeName == 'resources') {
            this.resourcesManager.loadFromXmlNode(subCh);
          } else if (subCh.nodeName == 'node_provider') {
            var nodeProviderName = subCh.getAttribute("ajxpClass");
            var nodeProviderOptions = JSON.parse(subCh.getAttribute("ajxpOptions"));
            this.nodeProviderDef = { name: nodeProviderName, options: nodeProviderOptions };
          }
        }
      }
    }
  };

  return Repository;
})();

exports['default'] = Repository;
module.exports = exports['default'];
